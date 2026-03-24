"use client";

import { useCreateStore } from "@/stores/create-store";
import { emotions } from "@/lib/emotions";
import { formatDuration } from "@/lib/utils";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export default function ResultsPage() {
  const router = useRouter();
  const store = useCreateStore();
  const emotionConfig = store.emotion ? emotions[store.emotion] : null;
  const accent = emotionConfig?.accent || "#a855f7";
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const song = store.songs.find((s) => s.status === "completed");

  useEffect(() => {
    if (!store.songs.length) router.replace("/create/prompt");
  }, [store.songs, router]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onTime = () => {
      setCurrentTime(audio.currentTime);
      setDuration(audio.duration || 0);
      setProgress(audio.duration ? audio.currentTime / audio.duration : 0);
    };
    const onEnd = () => { setPlaying(false); setProgress(0); setCurrentTime(0); };
    const onLoaded = () => setDuration(audio.duration || 0);
    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("ended", onEnd);
    audio.addEventListener("loadedmetadata", onLoaded);
    return () => {
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("ended", onEnd);
      audio.removeEventListener("loadedmetadata", onLoaded);
    };
  }, [song?.audio_url]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (playing) audioRef.current.pause();
    else audioRef.current.play();
    setPlaying(!playing);
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    audioRef.current.currentTime = pct * (audioRef.current.duration || 0);
  };

  const handleCreateCard = () => {
    if (!song) return;
    store.selectSong(song.id);
    router.push("/create/card");
  };

  const handleRegenerate = () => {
    router.push("/create/generate");
  };

  const lyricsLines = song?.lyrics
    ?.split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0 && !l.startsWith("[")) || [];

  if (!song) return null;

  return (
    <div className="min-h-screen relative pb-28" style={{ background: "#08080c" }}>
      {/* Background glows */}
      <div className="fixed inset-0 pointer-events-none">
        {emotionConfig && (
          <>
            <div
              className="absolute -top-20 -right-20 w-[400px] h-[400px] rounded-full blur-[120px]"
              style={{ background: `radial-gradient(circle, ${emotionConfig.colors[0]}12, transparent)` }}
            />
            <div
              className="absolute bottom-40 -left-20 w-[300px] h-[300px] rounded-full blur-[100px]"
              style={{ background: `radial-gradient(circle, ${emotionConfig.colors[1]}08, transparent)` }}
            />
          </>
        )}
      </div>

      <div className="relative z-10 px-6 pt-16 space-y-7">
        {/* Step indicator - all complete */}
        <div className="flex gap-1.5">
          {[1, 2, 3, 4, 5].map((step) => (
            <div key={step} className="h-[3px] rounded-full flex-[2] bg-gradient-to-r from-purple-500 to-pink-500" />
          ))}
        </div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-1"
        >
          <h1 className="text-[28px] font-bold tracking-tight text-white">
            Your song is ready
          </h1>
          <p className="text-white/40 text-[13px]">Listen and create your card</p>
        </motion.div>

        {/* Song card — single, prominent */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-3xl p-6 border border-white/[0.06] space-y-5"
          style={{ background: `linear-gradient(160deg, ${emotionConfig?.colors[0]}10, ${emotionConfig?.colors[1]}06, rgba(8,8,12,0.8))` }}
        >
          {/* Title + duration */}
          <div>
            <h2 className="text-[20px] font-bold text-white">{song.title || "Untitled Song"}</h2>
            {duration > 0 && (
              <p className="text-white/30 text-[13px] mt-1">{formatDuration(duration)}</p>
            )}
          </div>

          {/* Big play button + progress */}
          <div className="flex items-center gap-4">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={togglePlay}
              className="w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: accent }}
            >
              {playing ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="#08080c">
                  <rect x="6" y="4" width="4" height="16" rx="1" />
                  <rect x="14" y="4" width="4" height="16" rx="1" />
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="#08080c">
                  <polygon points="6 3 20 12 6 21 6 3" />
                </svg>
              )}
            </motion.button>

            <div className="flex-1 space-y-1.5">
              <div
                className="h-[4px] bg-white/[0.06] rounded-full cursor-pointer overflow-hidden"
                onClick={handleSeek}
              >
                <div
                  className="h-full rounded-full transition-all duration-100"
                  style={{ width: `${progress * 100}%`, backgroundColor: accent }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-white/25">
                <span>{formatDuration(currentTime)}</span>
                <span>{formatDuration(duration)}</span>
              </div>
            </div>
          </div>

          {/* Lyrics preview */}
          {lyricsLines.length > 0 && (
            <div className="space-y-1 pt-1">
              <p className="text-white/25 text-[11px] uppercase tracking-wider font-medium">Lyrics</p>
              <div className="space-y-0.5">
                {lyricsLines.slice(0, 6).map((line, i) => (
                  <p key={i} className="text-white/50 text-[13px] leading-relaxed">{line}</p>
                ))}
                {lyricsLines.length > 6 && (
                  <p className="text-white/20 text-[12px]">...and more</p>
                )}
              </div>
            </div>
          )}
        </motion.div>

        {/* Regenerate option */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleRegenerate}
          className="w-full h-[48px] rounded-2xl bg-white/[0.04] border border-white/[0.06] text-white/50 text-[13px] font-medium flex items-center justify-center gap-2 transition-all hover:bg-white/[0.06] hover:text-white/70"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <polyline points="23 4 23 10 17 10" /><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10" />
          </svg>
          Not feeling it? Regenerate
        </motion.button>
      </div>

      {/* Fixed bottom CTA */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-[430px] px-6 z-20">
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleCreateCard}
          className="w-full h-[56px] rounded-2xl bg-[#cbff00] text-[#08080c] font-bold text-[15px] shadow-[0_0_40px_rgba(203,255,0,0.15)] transition-all active:scale-[0.98]"
        >
          Create Card
        </motion.button>
      </div>

      {song.audio_url && <audio ref={audioRef} src={song.audio_url} preload="auto" />}
    </div>
  );
}
