"use client";

import { useAuth } from "@/providers/auth-provider";
import { getGreeting } from "@/lib/utils";
import { QUICK_PROMPTS, DAILY_SUGGESTIONS } from "@/lib/constants";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { useCreateStore } from "@/stores/create-store";

export default function HomePage() {
  const { profile, loading } = useAuth();
  const router = useRouter();
  const resetCreate = useCreateStore((s) => s.reset);

  const dailySuggestion = useMemo(() => {
    const idx = new Date().getDate() % DAILY_SUGGESTIONS.length;
    return DAILY_SUGGESTIONS[idx];
  }, []);

  const handleCreate = () => {
    resetCreate();
    router.push("/create/recipient");
  };

  if (loading) {
    return (
      <div className="px-6 pt-16 space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="w-10 h-10 rounded-full" />
          <div className="flex gap-3">
            <Skeleton className="w-10 h-10 rounded-full" />
            <Skeleton className="w-10 h-10 rounded-full" />
          </div>
        </div>
        <Skeleton className="h-10 w-56" />
        <div className="flex gap-3"><Skeleton className="h-9 w-16 rounded-full" /><Skeleton className="h-9 w-24 rounded-full" /><Skeleton className="h-9 w-20 rounded-full" /></div>
        <Skeleton className="h-48 w-full rounded-3xl" />
      </div>
    );
  }

  const name = profile?.display_name?.split(" ")[0] || "there";

  return (
    <div className="min-h-screen pb-28 bg-[#08080c]">
      {/* Top glow */}
      <div className="absolute top-0 left-0 right-0 h-[50vh] pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-[radial-gradient(ellipse,rgba(140,60,220,0.15)_0%,rgba(100,40,180,0.05)_50%,transparent_70%)]" />
      </div>

      <div className="relative z-10">
        {/* Header row */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center justify-between px-6 pt-16 pb-4"
        >
          {/* Avatar */}
          {profile?.avatar_url ? (
            <img src={profile.avatar_url} alt="" className="w-10 h-10 rounded-full border border-white/10 object-cover" />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500/30 to-pink-500/20 border border-white/[0.08] flex items-center justify-center text-sm font-bold text-white/50">
              {name.charAt(0).toUpperCase()}
            </div>
          )}
          {/* Icons */}
          <div className="flex items-center gap-2">
            <button className="w-10 h-10 rounded-full bg-white/[0.06] border border-white/[0.06] flex items-center justify-center text-white/40 hover:bg-white/[0.10] transition-colors">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            </button>
            <button className="w-10 h-10 rounded-full bg-white/[0.06] border border-white/[0.06] flex items-center justify-center text-white/40 hover:bg-white/[0.10] transition-colors">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>
            </button>
          </div>
        </motion.div>

        {/* Greeting */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="px-6 pb-6"
        >
          <h1 className="text-[32px] font-bold tracking-tight leading-tight">
            Hi, <span className="bg-gradient-to-r from-[#cbff00] to-[#a0cc00] bg-clip-text text-transparent">{name}</span>
          </h1>
        </motion.div>

        {/* Filter chips */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="flex gap-2 px-6 pb-7 overflow-x-auto no-scrollbar"
        >
          {["All", "New Release", "Trending", "Top", "For You"].map((label, i) => (
            <button
              key={label}
              className={cn(
                "flex-shrink-0 h-9 px-5 rounded-full text-[13px] font-semibold transition-all duration-200 border",
                i === 0
                  ? "bg-[#cbff00] text-[#08080c] border-[#cbff00]"
                  : "bg-transparent border-white/[0.10] text-white/50 hover:bg-white/[0.06] hover:text-white/70"
              )}
            >
              {label}
            </button>
          ))}
        </motion.div>

        {/* Hero Card — "Curated & trending" */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="px-6 pb-8"
        >
          <h2 className="text-[20px] font-bold tracking-tight mb-4">Curated & trending</h2>
          <button
            onClick={handleCreate}
            className="w-full relative overflow-hidden rounded-3xl text-left active:scale-[0.98] transition-transform"
          >
            {/* Card bg */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-400/90 via-purple-500/80 to-pink-400/70" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(0,0,0,0.3)_0%,transparent_60%)]" />
            {/* Decorative shape */}
            <div className="absolute -right-8 -bottom-8 w-40 h-40 rounded-full bg-[#cbff00]/20 blur-2xl" />

            <div className="relative px-6 py-7 min-h-[180px] flex flex-col justify-between">
              <div>
                <h3 className="text-[22px] font-bold text-white leading-tight mb-1.5">
                  Create a song
                </h3>
                <p className="text-white/60 text-[13px] leading-relaxed max-w-[200px]">
                  Turn your feelings into<br />a shareable experience.
                </p>
              </div>
              <div className="flex items-center gap-3 mt-4">
                <div className="w-11 h-11 rounded-full bg-[#08080c]/60 backdrop-blur-sm flex items-center justify-center">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><polygon points="6 3 20 12 6 21 6 3"/></svg>
                </div>
                <div className="flex gap-2">
                  <div className="w-9 h-9 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>
                  </div>
                  <div className="w-9 h-9 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                  </div>
                </div>
              </div>
            </div>
          </button>
        </motion.div>

        {/* Quick prompts section */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="px-6 pb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[20px] font-bold tracking-tight">Quick start</h2>
            <button className="text-white/30 text-[13px] font-medium hover:text-white/50 transition-colors">See all</button>
          </div>

          {/* Prompt items styled like playlist items */}
          <div className="space-y-2">
            {QUICK_PROMPTS.slice(0, 4).map((prompt, i) => (
              <motion.button
                key={prompt.label}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.35 + i * 0.05 }}
                onClick={handleCreate}
                className="w-full flex items-center gap-4 p-3 rounded-2xl transition-all duration-200 hover:bg-white/[0.04] active:scale-[0.98] group"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/10 border border-white/[0.05] flex items-center justify-center text-xl flex-shrink-0">
                  {prompt.emoji}
                </div>
                <div className="flex-1 text-left">
                  <p className="text-[14px] font-semibold text-white/90">{prompt.label}</p>
                  <p className="text-[12px] text-white/30 mt-0.5">Tap to start creating</p>
                </div>
                <div className="w-9 h-9 rounded-full bg-white/[0.04] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="white"><polygon points="6 3 20 12 6 21 6 3"/></svg>
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Your songs */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="px-6 pb-8"
        >
          <h2 className="text-[20px] font-bold tracking-tight mb-4">Your songs</h2>
          <div className="flex flex-col items-center py-12 rounded-2xl border border-dashed border-white/[0.05]">
            <div className="w-14 h-14 rounded-full bg-white/[0.03] flex items-center justify-center mb-3">
              <span className="text-2xl opacity-30">🎵</span>
            </div>
            <p className="text-white/20 text-[13px]">Your creations will appear here</p>
            <button
              onClick={handleCreate}
              className="mt-3 text-[#cbff00] text-[13px] font-semibold hover:underline"
            >
              Create your first →
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
