"use client";

import { useAuth } from "@/providers/auth-provider";
import { createClient } from "@/lib/supabase/client";
import { emotions } from "@/lib/emotions";
import { Skeleton } from "@/components/ui/skeleton";
import type { Card } from "@/lib/types";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type Tab = "songs" | "drafts" | "purchased";

const tabLabels: Record<Tab, string> = {
  songs: "Songs",
  drafts: "Drafts",
  purchased: "Purchased",
};

export default function LibraryPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("songs");
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchCards = async () => {
      setLoading(true);
      const supabase = createClient();

      let query = supabase
        .from("cards")
        .select("*, song:songs(*)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (tab === "purchased") {
        query = query.eq("is_premium", true);
      }

      const { data } = await query;
      setCards((data as Card[]) || []);
      setLoading(false);
    };

    fetchCards();
  }, [user, tab]);

  const emptyIcon = tab === "songs" ? "🎵" : tab === "drafts" ? "📝" : "💎";
  const emptyText =
    tab === "songs"
      ? "No songs yet"
      : tab === "drafts"
        ? "No drafts"
        : "No premium cards";

  return (
    <div className="min-h-screen bg-[#08080c] pb-28">
      <div className="px-6 pt-16 space-y-7">
        {/* Header */}
        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-[28px] font-bold tracking-tight text-white"
        >
          Library
        </motion.h1>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
          className="flex gap-2"
        >
          {(["songs", "drafts", "purchased"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                "px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200 border",
                tab === t
                  ? "bg-[#cbff00] border-[#cbff00] text-[#08080c]"
                  : "bg-transparent border-white/[0.08] text-white/40 hover:text-white/60 hover:border-white/[0.12]"
              )}
            >
              {tabLabels[t]}
            </button>
          ))}
        </motion.div>

        {/* Content */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-20 w-full rounded-2xl" />
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
              <span className="text-4xl opacity-40">{emptyIcon}</span>
            </div>
            <p className="text-white/40 text-sm">{emptyText}</p>
            {tab === "songs" && (
              <button
                onClick={() => router.push("/create/recipient")}
                className="mt-4 text-[#cbff00] text-sm font-medium hover:opacity-80 transition-opacity"
              >
                Create your first →
              </button>
            )}
          </motion.div>
        ) : (
          <div className="space-y-3">
            {cards.map((card, i) => {
              const emotionConfig = emotions[card.emotion];
              return (
                <motion.button
                  key={card.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: i * 0.05 }}
                  onClick={() => router.push(`/card/${card.id}`)}
                  className="w-full flex items-center gap-4 p-4 rounded-2xl bg-white/[0.04] border border-white/[0.06] text-left transition-all hover:bg-white/[0.06] hover:border-white/[0.10] active:scale-[0.98]"
                >
                  <div
                    className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                    style={{
                      background: `linear-gradient(135deg, ${emotionConfig?.colors[0]}22, ${emotionConfig?.colors[1]}11)`,
                    }}
                  >
                    {emotionConfig?.emoji || "🎵"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-white truncate">
                      {card.song?.title || "Untitled"}
                    </p>
                    <p className="text-white/40 text-xs mt-1 truncate">
                      To {card.to_name} · {emotionConfig?.label}
                    </p>
                  </div>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="text-white/20 flex-shrink-0"
                  >
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                </motion.button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
