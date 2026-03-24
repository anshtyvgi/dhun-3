"use client";

import { useAuth } from "@/providers/auth-provider";
import { Skeleton } from "@/components/ui/skeleton";
import { createClient } from "@/lib/supabase/client";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function ProfilePage() {
  const { user, profile, loading, signOut } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState({ songs: 0, cards: 0, shares: 0 });

  useEffect(() => {
    if (!user) return;
    const fetchStats = async () => {
      const supabase = createClient();
      const [songsRes, cardsRes] = await Promise.all([
        supabase
          .from("songs")
          .select("id", { count: "exact" })
          .eq("user_id", user.id),
        supabase
          .from("cards")
          .select("id, share_count", { count: "exact" })
          .eq("user_id", user.id),
      ]);

      const totalShares = (cardsRes.data || []).reduce(
        (sum: number, c: { share_count: number }) =>
          sum + (c.share_count || 0),
        0
      );

      setStats({
        songs: songsRes.count || 0,
        cards: cardsRes.count || 0,
        shares: totalShares,
      });
    };
    fetchStats();
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    router.push("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#08080c] px-6 pt-16 space-y-8">
        <div className="flex items-center gap-5">
          <Skeleton className="w-[72px] h-[72px] rounded-full" />
          <div className="space-y-2.5">
            <Skeleton className="h-6 w-32 rounded-xl" />
            <Skeleton className="h-4 w-48 rounded-xl" />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-28 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  const name = profile?.display_name || "User";

  return (
    <div className="min-h-screen bg-[#08080c] pb-28">
      <div className="px-6 pt-16 space-y-8">
        {/* Profile header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex items-center gap-5"
        >
          {profile?.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt=""
              className="rounded-full border-2 border-white/[0.08] object-cover"
              style={{ width: 72, height: 72 }}
            />
          ) : (
            <div
              className="rounded-full bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-2xl font-bold text-white/40"
              style={{ width: 72, height: 72 }}
            >
              {name.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <h1 className="text-[28px] font-bold tracking-tight text-white">
              {name}
            </h1>
            <p className="text-white/40 text-sm mt-0.5">
              {user?.email || user?.phone || ""}
            </p>
          </div>
        </motion.div>

        {/* Stats grid */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.08 }}
          className="grid grid-cols-3 gap-3"
        >
          {[
            { label: "Songs", value: stats.songs, emoji: "🎵" },
            { label: "Cards", value: stats.cards, emoji: "🎴" },
            { label: "Shares", value: stats.shares, emoji: "🔗" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl bg-white/[0.04] border border-white/[0.06] p-5 text-center space-y-2"
            >
              <p className="text-2xl">{stat.emoji}</p>
              <p className="text-xl font-bold text-white">{stat.value}</p>
              <p className="text-white/40 text-xs">{stat.label}</p>
            </div>
          ))}
        </motion.div>

        {/* Settings */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.16 }}
          className="space-y-3"
        >
          <h2 className="text-[20px] font-bold tracking-tight text-white">
            Settings
          </h2>

          <div className="rounded-2xl bg-white/[0.04] border border-white/[0.06] divide-y divide-white/[0.04]">
            <SettingsRow
              label="Language"
              value={profile?.language || "English"}
            />
            <SettingsRow label="Notifications" value="Enabled" />
            <SettingsRow label="Privacy" value="Public" />
          </div>
        </motion.div>

        {/* Sign out */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.24 }}
        >
          <button
            onClick={handleSignOut}
            className="w-full py-4 rounded-2xl bg-red-500/[0.08] border border-red-500/[0.10] text-red-400 font-medium text-sm transition-all hover:bg-red-500/[0.12] active:scale-[0.98]"
          >
            Sign Out
          </button>
        </motion.div>

        {/* Footer */}
        <p className="text-white/[0.15] text-xs text-center pb-4">
          Dhun v1.0
        </p>
      </div>
    </div>
  );
}

function SettingsRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between px-5 py-4">
      <span className="text-sm text-white">{label}</span>
      <div className="flex items-center gap-2">
        <span className="text-white/40 text-sm">{value}</span>
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="text-white/20"
        >
          <path d="M9 18l6-6-6-6" />
        </svg>
      </div>
    </div>
  );
}
