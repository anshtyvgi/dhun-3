"use client";

import { createClient } from "@/lib/supabase/client";
import { emotions, emotionList } from "@/lib/emotions";
import { Skeleton } from "@/components/ui/skeleton";
import type { Card } from "@/lib/types";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function ExplorePage() {
  const router = useRouter();
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string | null>(null);

  useEffect(() => {
    const fetchCards = async () => {
      setLoading(true);
      const supabase = createClient();

      let query = supabase
        .from("cards")
        .select("*, song:songs(*)")
        .eq("is_public", true)
        .order("view_count", { ascending: false })
        .limit(20);

      if (filter) {
        query = query.eq("emotion", filter);
      }

      const { data } = await query;
      setCards((data as Card[]) || []);
      setLoading(false);
    };

    fetchCards();
  }, [filter]);

  return (
    <div className="min-h-screen bg-[#08080c] pb-28">
      <div className="px-6 pt-16 space-y-7">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="space-y-1.5"
        >
          <h1 className="text-[28px] font-bold tracking-tight text-white">
            Explore
          </h1>
          <p className="text-white/40 text-sm">
            Discover what others are feeling
          </p>
        </motion.div>

        {/* Emotion filter chips */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
          className="flex gap-2 overflow-x-auto no-scrollbar -mx-6 px-6 pb-1"
        >
          <button
            onClick={() => setFilter(null)}
            className={cn(
              "flex-shrink-0 px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200 border whitespace-nowrap",
              filter === null
                ? "bg-[#cbff00] border-[#cbff00] text-[#08080c]"
                : "bg-transparent border-white/[0.08] text-white/40 hover:text-white/60 hover:border-white/[0.12]"
            )}
          >
            All
          </button>
          {emotionList.map((e) => (
            <button
              key={e.id}
              onClick={() => setFilter(e.id)}
              className={cn(
                "flex-shrink-0 px-4 py-2.5 rounded-full text-sm font-medium transition-all duration-200 border whitespace-nowrap",
                filter === e.id
                  ? "border-transparent"
                  : "bg-transparent border-white/[0.08] text-white/40 hover:text-white/60 hover:border-white/[0.12]"
              )}
              style={
                filter === e.id
                  ? {
                      background: `${e.accent}25`,
                      borderColor: `${e.accent}40`,
                      color: e.accent,
                    }
                  : undefined
              }
            >
              {e.emoji} {e.label}
            </button>
          ))}
        </motion.div>

        {/* Cards */}
        {loading ? (
          <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-48 rounded-2xl" />
            ))}
          </div>
        ) : cards.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col items-center justify-center py-24"
          >
            <div className="w-20 h-20 rounded-full bg-white/[0.04] border border-white/[0.06] flex items-center justify-center mb-5">
              <span className="text-4xl opacity-40">🌍</span>
            </div>
            <p className="text-white/40 text-sm">No public cards yet</p>
            <p className="text-white/20 text-xs mt-1.5">
              Be the first to share!
            </p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {cards.map((card, i) => {
              const emotionConfig = emotions[card.emotion];
              return (
                <motion.button
                  key={card.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.35, delay: i * 0.04 }}
                  onClick={() => router.push(`/card/${card.id}`)}
                  className="relative overflow-hidden rounded-2xl border border-white/[0.06] text-left transition-all hover:border-white/[0.12] active:scale-[0.97] h-48"
                >
                  <div
                    className="absolute inset-0"
                    style={{
                      background: `linear-gradient(145deg, ${emotionConfig?.colors[0]}18, ${emotionConfig?.colors[1]}0a, transparent)`,
                    }}
                  />
                  <div className="relative h-full flex flex-col justify-between p-4">
                    <span className="text-2xl">{emotionConfig?.emoji}</span>
                    <div>
                      <p className="font-semibold text-sm text-white truncate">
                        {card.song?.title || "Untitled"}
                      </p>
                      <p className="text-white/40 text-xs mt-1">
                        {card.from_name} → {card.to_name}
                      </p>
                      <div className="flex items-center gap-3 mt-2.5 text-white/20 text-[10px]">
                        <span>👀 {card.view_count}</span>
                        <span>🔗 {card.share_count}</span>
                      </div>
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
