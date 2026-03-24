"use client";

import { useCreateStore } from "@/stores/create-store";
import { emotions } from "@/lib/emotions";
import { cn, formatDuration } from "@/lib/utils";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export default function ResultsPage() {
  const router = useRouter();
  const store = useCreateStore();
  const emotionConfig = store.emotion ? emotions[store.emotion] : null;
  const accent = emotionConfig?.accent || "#a855f7";
  const pollRef = useRef<NodeJS.Timeout | null>(null);
  const [songs, setSongs] = useState(store.songs);

  // Poll for song completion
  useEffect(() => {
    if (!songs.length) {
      router.replace("/create/prompt");
      return;
    }

    const taskIds = songs
      .filter((s) => s.suno_task_id)
      .map((s) => s.suno_task_id);

    if (taskIds.length === 0) return;

    const poll = async () => {
      try {
        const res = await fetch(`/api/generate/status?taskIds=${taskIds.join(",")}`);
        const raw = await res.text();
        let data;
        try { data = JSON.parse(raw); }
        catch { data = JSON.parse(raw.replace(/[\x00-\x1f\x7f]/g, " ")); }

        if (data.songs) {
          setSongs(data.songs);
          store.setSongs(data.songs);

          // Auto-select first completed if none selected
          const completed = data.songs.filter((s: { status: string }) => s.status === "completed");
          if (completed.length > 0 && !store.selectedSongId) {
            store.selectSong(completed[0].id);
          }

          // Stop polling if all done
          const allDone = data.songs.every((s: { status: string }) =>
            s.status === "completed" || s.status === "failed"
          );
          if (allDone && pollRef.current) {
            clearInterval(pollRef.current);
          }
        }
      } catch { /* ignore poll errors */ }
    };

    // Poll immediately then every 3s
    poll();
    pollRef.current = setInterval(poll, 3000);

    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, []);

  const completedSongs = songs.filter((s) => s.status === "completed");
  const pendingSongs = songs.filter((s) => s.status === "generating" || s.status === "pending");

  return (
    <div className="min-h-screen relative pb-28" style={{ background: "#08080c" }}>
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        {emotionConfig && (
          <div className="absolute -top-20 -right-20 w-[400px] h-[400px] rounded-full blur-[120px]"
            style={{ background: `radial-gradient(circle, ${emotionConfig.colors[0]}12, transparent)` }} />
        )}
      </div>

      <div className="relative z-10 px-6 pt-16 space-y-6">
        {/* Header */}
        <div className="space-y-1">
          <h1 className="text-[28px] font-bold tracking-tight text-white">
            {completedSongs.length > 0 ? "Your songs" : "Creating songs..."}
          </h1>
          <p className="text-white/40 text-[13px]">
            {completedSongs.length} of {songs.length} ready
            {pendingSongs.length > 0 && " — more coming"}
          </p>
        </div>

        {/* Song cards */}
        <div className="space-y-3">
          {songs.map((song, i) => (
            <SongCard
              key={song.id || song.suno_task_id || i}
              song={song}
              index={i}
              selected={store.selectedSongId === song.id}
              onSelect={() => song.status === "completed" && store.selectSong(song.id)}
              accent={accent}
            />
          ))}
        </div>

        {/* Regenerate */}
        <button
          onClick={() => { store.setSongs([]); router.push("/create/generate"); }}
          className="w-full h-11 rounded-2xl bg-white/[0.03] border border-white/[0.06] text-white/30 text-[13px] font-medium flex items-center justify-center gap-2 hover:bg-white/[0.06] hover:text-white/50 transition-all"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <polyline points="23 4 23 10 17 10" /><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10" />
          </svg>
          Regenerate
        </button>
      </div>

      {/* CTA */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-[430px] px-6 z-20">
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => store.selectedSongId && router.push("/create/card")}
          disabled={!store.selectedSongId}
          className={cn(
            "w-full h-[56px] rounded-2xl font-bold text-[15px] transition-all",
            store.selectedSongId
              ? "bg-[#cbff00] text-[#08080c] shadow-[0_0_30px_rgba(203,255,0,0.15)]"
              : "bg-white/[0.04] text-white/15 cursor-not-allowed"
          )}
        >
          Create Card
        </motion.button>
      </div>
    </div>
  );
}

function SongCard({ song, index, selected, onSelect, accent }: {
  song: { id: string; suno_task_id?: string | null; title?: string | null; audio_url?: string | null; lyrics?: string | null; duration_seconds?: number | null; status: string };
  index: number;
  selected: boolean;
  onSelect: () => void;
  accent: string;
}) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const isReady = song.status === "completed" && !!song.audio_url;

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!audioRef.current || !isReady) return;
    if (playing) audioRef.current.pause();
    else audioRef.current.play();
    setPlaying(!playing);
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onTime = () => setProgress(audio.currentTime / (audio.duration || 1));
    const onEnd = () => { setPlaying(false); setProgress(0); };
    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("ended", onEnd);
    return () => { audio.removeEventListener("timeupdate", onTime); audio.removeEventListener("ended", onEnd); };
  }, [song.audio_url]);

  const lyricsPreview = song.lyrics?.split("\n").filter((l) => l.trim() && !l.startsWith("[")).slice(0, 2).join(" · ");

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      onClick={onSelect}
      className={cn(
        "rounded-2xl p-5 border transition-all duration-300",
        !isReady && "opacity-60",
        isReady && "cursor-pointer",
        selected ? "bg-white/[0.06]" : "bg-white/[0.03] border-white/[0.06]"
      )}
      style={selected ? { borderColor: `${accent}50` } : undefined}
    >
      <div className="flex items-center gap-4">
        {/* Play button or skeleton */}
        <motion.button
          whileTap={isReady ? { scale: 0.9 } : undefined}
          onClick={togglePlay}
          className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ background: isReady ? `${accent}25` : "rgba(255,255,255,0.04)" }}
        >
          {!isReady ? (
            <div className="w-5 h-5 rounded-full border-2 border-white/20 border-t-white/60 animate-spin" />
          ) : playing ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><rect x="6" y="4" width="4" height="16" rx="1" /><rect x="14" y="4" width="4" height="16" rx="1" /></svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><polygon points="6 3 20 12 6 21 6 3" /></svg>
          )}
        </motion.button>

        <div className="flex-1 min-w-0">
          {isReady ? (
            <>
              <p className="font-semibold text-[14px] text-white truncate">{song.title || `Song ${index + 1}`}</p>
              {lyricsPreview && <p className="text-white/30 text-[12px] mt-0.5 truncate">{lyricsPreview}</p>}
              {song.duration_seconds && <p className="text-white/15 text-[11px] mt-0.5">{formatDuration(song.duration_seconds)}</p>}
            </>
          ) : (
            <>
              <div className="h-4 w-32 rounded bg-white/[0.06] animate-pulse" />
              <div className="h-3 w-48 rounded bg-white/[0.04] animate-pulse mt-2" />
            </>
          )}
        </div>

        {/* Selection check */}
        {selected && (
          <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: accent }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#08080c" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>
          </div>
        )}
      </div>

      {/* Progress */}
      {isReady && progress > 0 && (
        <div className="h-[3px] bg-white/[0.06] rounded-full overflow-hidden mt-3">
          <div className="h-full rounded-full transition-[width] duration-200" style={{ width: `${progress * 100}%`, backgroundColor: accent }} />
        </div>
      )}

      {song.audio_url && <audio ref={audioRef} src={song.audio_url} preload="none" />}
    </motion.div>
  );
}
