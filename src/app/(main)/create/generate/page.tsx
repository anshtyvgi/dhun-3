"use client";

import { useCreateStore } from "@/stores/create-store";
import { emotions } from "@/lib/emotions";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef, useCallback } from "react";

const LOADING_MESSAGES = [
  "Composing your feelings...",
  "Adding the right notes...",
  "Mixing emotions into melody...",
  "Tuning the heartstrings...",
  "Almost there...",
];

export default function GeneratePage() {
  const router = useRouter();
  const store = useCreateStore();
  const [messageIdx, setMessageIdx] = useState(0);
  const [started, setStarted] = useState(false);
  const pollRef = useRef<NodeJS.Timeout | null>(null);

  const emotionConfig = store.emotion ? emotions[store.emotion] : null;
  const colors = emotionConfig?.colors || ["#a855f7", "#ec4899", "#f97316"];

  const startGeneration = useCallback(async () => {
    try {
      const allChips = [
        ...store.moodChips,
        ...store.genreChips,
        ...store.languageChips,
        ...store.intentChips,
      ];

      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          promptText: store.promptText,
          enhancedPrompt: store.enhancedPrompt,
          chips: allChips,
          emotion: store.emotion,
          recipientType: store.recipient,
        }),
      });

      const data = await res.json();
      if (data.batchId) {
        store.setBatchId(data.batchId);
        startPolling(data.batchId);
      }
    } catch (err) {
      console.error("Generation failed:", err);
    }
  }, [store]);

  const startPolling = (batchId: string) => {
    pollRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/generate/status?batchId=${batchId}`);
        const data = await res.json();

        if (data.songs && data.songs.length > 0) {
          const completed = data.songs.filter(
            (s: { status: string }) => s.status === "completed"
          );
          if (completed.length >= 1) {
            store.setSongs(data.songs);
            store.selectSong(completed[0].id);
            if (pollRef.current) clearInterval(pollRef.current);
            router.push("/create/results");
          }
        }

        if (data.status === "failed") {
          if (pollRef.current) clearInterval(pollRef.current);
        }
      } catch (err) {
        console.error("Polling error:", err);
      }
    }, 4000);
  };

  useEffect(() => {
    if (!store.emotion) {
      router.replace("/create/prompt");
      return;
    }
    if (!started) {
      setStarted(true);
      startGeneration();
    }

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [store.emotion, router, started, startGeneration]);

  // Cycle through messages
  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIdx((i) => (i + 1) % LOADING_MESSAGES.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="min-h-screen relative flex flex-col items-center justify-center overflow-hidden"
      style={{ background: "#08080c" }}
    >
      {/* Background emotion-colored radial gradient blobs */}
      <div className="fixed inset-0 pointer-events-none">
        <div
          className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full blur-[150px] opacity-[0.12]"
          style={{
            background: `radial-gradient(circle, ${colors[0]}, transparent 70%)`,
          }}
        />
        <div
          className="absolute bottom-1/4 left-1/4 w-[350px] h-[350px] rounded-full blur-[120px] opacity-[0.08]"
          style={{
            background: `radial-gradient(circle, ${colors[1]}, transparent 70%)`,
          }}
        />
        <div
          className="absolute top-1/3 right-0 w-[300px] h-[300px] rounded-full blur-[120px] opacity-[0.06]"
          style={{
            background: `radial-gradient(circle, ${colors[2]}, transparent 70%)`,
          }}
        />
      </div>

      <div className="relative z-10 flex flex-col items-center space-y-8 px-6">
        {/* Animated waveform - 12 bars */}
        <div className="flex items-end gap-[5px] h-20">
          {Array.from({ length: 12 }).map((_, i) => (
            <motion.div
              key={i}
              className="w-[5px] rounded-full"
              style={{
                background: `linear-gradient(to top, ${colors[0]}, ${colors[2]})`,
              }}
              animate={{
                height: ["20%", `${40 + Math.random() * 60}%`, "20%"],
              }}
              transition={{
                duration: 1 + Math.random() * 0.5,
                repeat: Infinity,
                delay: i * 0.1,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>

        {/* Cycling text messages */}
        <AnimatePresence mode="wait">
          <motion.p
            key={messageIdx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-lg font-medium text-center text-white"
          >
            {LOADING_MESSAGES[messageIdx]}
          </motion.p>
        </AnimatePresence>

        {/* Hint */}
        <p className="text-white/20 text-[13px] text-center">
          This usually takes 30–60 seconds
        </p>
      </div>
    </div>
  );
}
