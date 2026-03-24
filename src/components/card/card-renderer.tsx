"use client";

import { CardBackground } from "./card-background";
import { AudioPlayer } from "./audio-player";
import { LyricsDisplay } from "./lyrics-display";
import { CardMetadata } from "./card-metadata";
import { ShareCta } from "./share-cta";
import { emotions } from "@/lib/emotions";
import { useAudioPlayer } from "@/hooks/use-audio-player";
import type { Card, Song } from "@/lib/types";
import { motion } from "framer-motion";

interface CardRendererProps {
  card: Card;
  song: Song;
  showShareCta?: boolean;
  onPaymentRequired?: (type: "download" | "share") => void;
}

export function CardRenderer({
  card,
  song,
  showShareCta = true,
  onPaymentRequired,
}: CardRendererProps) {
  const emotionConfig = emotions[card.emotion];
  const { progress } = useAudioPlayer(song.audio_url);

  return (
    <div className="relative w-full min-h-screen flex flex-col bg-[#08080c]">
      <CardBackground emotion={card.emotion} imageUrl={card.background_url} />

      <div className="relative z-10 flex-1 flex flex-col justify-between px-6 pt-14 pb-8">
        {/* Top: Metadata */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <CardMetadata
            fromName={card.from_name}
            toName={card.to_name}
            emotion={card.emotion}
            timestamp={card.created_at}
          />
        </motion.div>

        {/* Center: Title + Lyrics */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="space-y-6 my-8"
        >
          <h2 className="text-[26px] font-bold tracking-tight">
            {song.title || "Untitled Song"}
          </h2>

          {card.message && (
            <p className="text-white/40 text-[13px] italic leading-relaxed">
              &ldquo;{card.message}&rdquo;
            </p>
          )}

          <LyricsDisplay
            lyrics={song.lyrics}
            progress={progress}
            accentColor={emotionConfig.accent}
          />
        </motion.div>

        {/* Bottom: Player + Share */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="space-y-5"
        >
          <AudioPlayer audioUrl={song.audio_url} accentColor={emotionConfig.accent} />

          {showShareCta && (
            <ShareCta
              cardId={card.id}
              isPremium={card.is_premium}
              onPaymentRequired={onPaymentRequired}
            />
          )}
        </motion.div>
      </div>

      {/* Watermark */}
      {!card.is_premium && (
        <div className="absolute bottom-3 right-5 text-[10px] text-white/10 font-medium">
          Made with Dhun
        </div>
      )}
    </div>
  );
}
