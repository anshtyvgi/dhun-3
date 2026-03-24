"use client";

import { emotions } from "@/lib/emotions";
import type { EmotionType } from "@/lib/types";
import { motion } from "framer-motion";

interface CardBackgroundProps {
  emotion: EmotionType;
  imageUrl?: string | null;
}

export function CardBackground({ emotion, imageUrl }: CardBackgroundProps) {
  const config = emotions[emotion];
  const [c1, c2, c3] = config.colors;

  return (
    <div className="absolute inset-0 overflow-hidden">
      {imageUrl ? (
        <>
          <img
            src={imageUrl}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />
        </>
      ) : (
        <>
          {/* Animated gradient background */}
          <motion.div
            className="absolute inset-0 animate-gradient"
            style={{
              background: `
                radial-gradient(ellipse at 20% 20%, ${c1}40 0%, transparent 50%),
                radial-gradient(ellipse at 80% 40%, ${c2}30 0%, transparent 50%),
                radial-gradient(ellipse at 40% 80%, ${c3}25 0%, transparent 50%),
                linear-gradient(180deg, #0B0B0F 0%, #121218 100%)
              `,
              backgroundSize: "200% 200%",
            }}
            animate={{
              scale: [1, 1.05, 1],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          {/* Overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30" />
        </>
      )}
    </div>
  );
}
