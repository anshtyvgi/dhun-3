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

  useEffect(() => {
    if (!store.songs.length) {
      router.replace("/create/prompt");
      return;
    }
    // Keep polling for remaining songs
    const hasPending = store.songs.some((s) => s.status === "generating" || s.status === "pending");
    if (hasPending && store.songs[0]?.batch_id) {
      pollRef.current = setInterval(async () => {
        try {
          const res = await fetch(`/api/generate/status?batchId=${store.songs[0].batch_id}`);
          const data = await res.json();
          if (data.songs) store.setSongs(data.songs);
          const stillPending = data.songs?.some((s: { status: string }) => s.status === "generating" || s.status === "pending");
          if (!stillPending && pollRef.current) clearInterval(pollRef.current);
        } catch { /* ignore */ }
      }, 4000);
    }
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [store.songs.length]);

  const completedSongs = store.songs.filter((s) => s.status === "completed");
  const pendingSongs = store.songs.filter((s) => s.status === "generating" || s.status === "pending");

  const handleCreateCard = () => {
    if (!store.selectedSongId) return;
    router.push("/create/card");
  };

  return (
    <div className="min-h-screen relative pb-28" style={{ background: "#08080c" }}>
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        {emotionConfig && (
          <div
            className="absolute -top-20 -right-20 w-[400px] h-[400px] rounded-full blur-[120px]"
            style={{ background: `radial-gradient(circle, ${emotionConfig.colors[0]}12, transparent)` }}
          />
        )}
      </div>

      <div className="relative z-10 px-6 pt-16 space-y-7">
        {/* Step indicator — all complete */}
        <div className="flex gap-1.5">
          {[1, 2, 3, 4, 5].map((step) => (
            <div key={step} className="h-[3px] rounded-full flex-[2] bg-gradient-to-r from-purple-500 to-pink-500" />
          ))}
        </div>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-1">
          <h1 className="text-[28px] font-bold tracking-tight text-white">
            {completedSongs.length > 0 ? "Pick your song" : "Generating..."}
          </h1>
          <p className="text-white/40 text-[13px]">
            {completedSongs.length} of {store.songs.length} ready
            {pendingSongs.length > 0 && " — more coming"}
          </p>
        </motion.div>

        {/* Song list */}
        <div className="space-y-3">
          {store.songs.map((song, i) => (
            <SongCard
              key={song.id}
              song={song}
              index={i}
              selected={store.selectedSongId === song.id}
              onSelect={() => song.status === "completed" && store.selectSong(song.id)}
              accentColor={accent}
            />
          ))}
        </div>

        {/* Regenerate */}
        <button
          onClick={() => router.push("/create/generate")}
          className="w-full h-[44px] rounded-2xl bg-white/[0.03] border border-white/[0.06] text-white/40 text-[13px] font-medium flex items-center justify-center gap-2 transition-all hover:bg-white/[0.06] hover:text-white/60"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <polyline points="23 4 23 10 17 10" /><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10" />
          </svg>
          Regenerate all
        </button>
      </div>

      {/* Fixed CTA */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-[430px] px-6 z-20">
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleCreateCard}
          disabled={!store.selectedSongId}
          className={cn(
            "w-full h-[56px] rounded-2xl font-bold text-[15px] transition-all duration-300",
            store.selectedSongId
              ? "bg-[#cbff00] text-[#08080c] shadow-[0_0_40px_rgba(203,255,0,0.15)]"
              : "bg-white/[0.05] text-white/20 cursor-not-allowed"
          )}
        >
          Create Card
        </motion.button>
      </div>
    </div>
  );
}

function SongCard({
  song,
  index,
  selected,
  onSelect,
  accentColor,
}: {
  song: { id: string; title: string | null; audio_url: string | null; lyrics: string | null; duration_seconds: number | null; status: string };
  index: number;
  selected: boolean;
  onSelect: () => void;
  accentColor: string;
}) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  const isReady = song.status === "completed";

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
  }, []);

  const lyricsPreview = song.lyrics?.split("\n").filter(Boolean).slice(0, 2).join(" · ");

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      onClick={onSelect}
      className={cn(
        "rounded-2xl p-5 border transition-all duration-300",
        !isReady && "opacity-50",
        isReady && "cursor-pointer",
        selected
          ? "bg-white/[0.06]"
          : "bg-white/[0.03] border-white/[0.06] hover:bg-white/[0.05]"
      )}
      style={selected ? { borderColor: `${accentColor}50` } : undefined}
    >
      <div className="flex items-center gap-4">
        {/* Play button or spinner */}
        <motion.button
          whileTap={isReady ? { scale: 0.9 } : undefined}
          onClick={togglePlay}
          className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ background: isReady ? `${accentColor}25` : "rgba(255,255,255,0.04)" }}
        >
          {!isReady ? (
            <svg className="animate-spin h-5 w-5 text-white/30" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : playing ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><rect x="6" y="4" width="4" height="16" rx="1" /><rect x="14" y="4" width="4" height="16" rx="1" /></svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><polygon points="6 3 20 12 6 21 6 3" /></svg>
          )}
        </motion.button>

        <div className="flex-1 min-w-0">
          <p className="font-semibold text-[14px] text-white truncate">
            {isReady ? (song.title || `Song ${index + 1}`) : "Generating..."}
          </p>
          {isReady && lyricsPreview && (
            <p className="text-white/30 text-[12px] mt-0.5 truncate">{lyricsPreview}</p>
          )}
          {isReady && song.duration_seconds && (
            <p className="text-white/20 text-[11px] mt-0.5">{formatDuration(song.duration_seconds)}</p>
          )}
          {!isReady && (
            <p className="text-white/20 text-[12px] mt-0.5">Still cooking...</p>
          )}
        </div>

        {/* Selection indicator */}
        {selected && (
          <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: accentColor }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#08080c" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>
          </div>
        )}
      </div>

      {/* Progress bar (only for ready songs) */}
      {isReady && progress > 0 && (
        <div className="h-[3px] bg-white/[0.06] rounded-full overflow-hidden mt-3">
          <div className="h-full rounded-full" style={{ width: `${progress * 100}%`, backgroundColor: accentColor }} />
        </div>
      )}

      {song.audio_url && <audio ref={audioRef} src={song.audio_url} preload="none" />}
    </motion.div>
  );
}
