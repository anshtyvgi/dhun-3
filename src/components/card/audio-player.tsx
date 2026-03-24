"use client";

import { useAudioPlayer } from "@/hooks/use-audio-player";
import { formatDuration } from "@/lib/utils";
import { motion } from "framer-motion";

interface AudioPlayerProps {
  audioUrl: string | null;
  accentColor?: string;
}

export function AudioPlayer({ audioUrl, accentColor = "#cbff00" }: AudioPlayerProps) {
  const { isPlaying, currentTime, duration, progress, toggle, seekToProgress } =
    useAudioPlayer(audioUrl);

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    seekToProgress(Math.max(0, Math.min(1, pct)));
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        {/* Play/Pause */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={toggle}
          className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: accentColor }}
        >
          {isPlaying ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="#08080c">
              <rect x="6" y="4" width="4" height="16" rx="1" />
              <rect x="14" y="4" width="4" height="16" rx="1" />
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="#08080c">
              <polygon points="6 3 20 12 6 21 6 3" />
            </svg>
          )}
        </motion.button>

        <div className="flex-1 space-y-1.5">
          {/* Progress bar */}
          <div
            className="h-[3px] bg-white/[0.08] rounded-full cursor-pointer relative overflow-hidden"
            onClick={handleSeek}
          >
            <div
              className="h-full rounded-full transition-all duration-100"
              style={{
                width: `${progress * 100}%`,
                backgroundColor: accentColor,
              }}
            />
          </div>
          {/* Time */}
          <div className="flex justify-between text-[10px] text-white/25">
            <span>{formatDuration(currentTime)}</span>
            <span>{formatDuration(duration)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
