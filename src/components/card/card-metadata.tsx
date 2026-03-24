"use client";

import { emotions } from "@/lib/emotions";
import type { EmotionType } from "@/lib/types";

interface CardMetadataProps {
  fromName: string;
  toName: string;
  emotion: EmotionType;
  timestamp?: string;
}

export function CardMetadata({
  fromName,
  toName,
  emotion,
  timestamp,
}: CardMetadataProps) {
  const emotionConfig = emotions[emotion];

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-white/60 text-sm">
        <span className="font-medium text-white">{fromName}</span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
        <span className="font-medium text-white">{toName}</span>
      </div>

      <div className="flex items-center gap-2">
        <span
          className="px-3 py-1 rounded-full text-xs font-medium"
          style={{
            background: `${emotionConfig.accent}20`,
            color: emotionConfig.accent,
          }}
        >
          {emotionConfig.emoji} {emotionConfig.label}
        </span>
        {timestamp && (
          <span className="text-white/30 text-xs">
            {new Date(timestamp).toLocaleDateString()}
          </span>
        )}
      </div>
    </div>
  );
}
