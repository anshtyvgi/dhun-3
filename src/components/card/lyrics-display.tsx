"use client";

import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useMemo } from "react";

interface LyricsDisplayProps {
  lyrics: string | null;
  progress: number; // 0 to 1
  accentColor?: string;
  compact?: boolean;
}

export function LyricsDisplay({
  lyrics,
  progress,
  accentColor = "#a855f7",
  compact = false,
}: LyricsDisplayProps) {
  const lines = useMemo(() => {
    if (!lyrics) return [];
    return lyrics
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0 && !line.startsWith("["));
  }, [lyrics]);

  if (!lines.length) return null;

  const currentLineIdx = Math.min(
    Math.floor(progress * lines.length),
    lines.length - 1
  );

  const visibleRange = compact ? 3 : 5;
  const startIdx = Math.max(0, currentLineIdx - Math.floor(visibleRange / 2));
  const visibleLines = lines.slice(startIdx, startIdx + visibleRange);

  return (
    <div className={cn("space-y-2 overflow-hidden", compact ? "max-h-24" : "max-h-48")}>
      <AnimatePresence mode="popLayout">
        {visibleLines.map((line, i) => {
          const actualIdx = startIdx + i;
          const isCurrent = actualIdx === currentLineIdx;
          const isPast = actualIdx < currentLineIdx;

          return (
            <motion.p
              key={`${actualIdx}-${line}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{
                opacity: isCurrent ? 1 : isPast ? 0.3 : 0.5,
                y: 0,
                scale: isCurrent ? 1 : 0.95,
              }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className={cn(
                "transition-all duration-300 leading-relaxed",
                isCurrent
                  ? "text-white font-semibold text-lg"
                  : "text-white/40 text-base"
              )}
              style={
                isCurrent ? { textShadow: `0 0 30px ${accentColor}40` } : undefined
              }
            >
              {line}
            </motion.p>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
