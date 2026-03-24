"use client";

import { useCreateStore } from "@/stores/create-store";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";

export default function GeneratePage() {
  const router = useRouter();
  const store = useCreateStore();
  const [error, setError] = useState<string | null>(null);
  const [log, setLog] = useState<string[]>([]);
  const hasStarted = useRef(false);

  const addLog = (msg: string) => {
    console.log(`[Generate] ${msg}`);
    setLog((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
  };

  useEffect(() => {
    if (!store.emotion) {
      router.replace("/create/prompt");
      return;
    }
    if (hasStarted.current) return;
    hasStarted.current = true;

    const run = async () => {
      addLog("Calling /api/generate...");

      try {
        const res = await fetch("/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            promptText: store.promptText,
            enhancedPrompt: store.enhancedPrompt,
            chips: [...store.moodChips, ...store.genreChips, ...store.languageChips, ...store.intentChips],
            emotion: store.emotion,
            recipientType: store.recipient,
          }),
        });

        addLog(`Status: ${res.status}`);
        const raw = await res.text();
        let data;
        try { data = JSON.parse(raw); }
        catch { data = JSON.parse(raw.replace(/[\x00-\x1f\x7f]/g, " ")); }

        const songs = data.songs || [];
        const validSongs = songs.filter((s: { suno_task_id?: string; status?: string }) =>
          s.suno_task_id && s.status !== "failed"
        );

        addLog(`Songs: ${validSongs.length} valid out of ${songs.length}`);

        // Show errors
        songs.filter((s: { status?: string }) => s.status === "failed").forEach((s: { error?: string }) => {
          addLog(`ERROR: ${s.error || "unknown"}`);
        });

        if (validSongs.length === 0) {
          setError(songs[0]?.error || data.error || "No songs generated");
          return;
        }

        // Store task IDs and go to results immediately — results page will poll
        const taskIds = validSongs.map((s: { suno_task_id: string }) => s.suno_task_id);
        addLog(`Task IDs: ${taskIds.join(", ")}`);

        // Store songs with task IDs in zustand and navigate
        store.setSongs(validSongs);
        store.setBatchId(data.batchId || "batch");

        addLog("Navigating to results (skeleton loading)...");
        router.push("/create/results");
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        addLog(`FATAL: ${msg}`);
        setError(msg);
      }
    };

    run();
  }, [store.emotion]);

  const colors = ["#a855f7", "#ec4899", "#f97316"];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center" style={{ background: "#08080c" }}>
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[400px] h-[400px] rounded-full blur-[150px] opacity-10"
          style={{ background: `radial-gradient(circle, ${colors[0]}, transparent)` }} />
      </div>

      <div className="relative z-10 flex flex-col items-center space-y-6 px-6 w-full max-w-[380px]">
        {/* Waveform */}
        {!error && (
          <div className="flex items-end gap-[4px] h-16">
            {Array.from({ length: 12 }).map((_, i) => (
              <motion.div key={i} className="w-[4px] rounded-full"
                style={{ background: `linear-gradient(to top, ${colors[0]}, ${colors[2]})` }}
                animate={{ height: ["20%", `${40 + Math.random() * 60}%`, "20%"] }}
                transition={{ duration: 1 + Math.random() * 0.5, repeat: Infinity, delay: i * 0.1 }}
              />
            ))}
          </div>
        )}

        {error ? (
          <div className="space-y-4 text-center">
            <p className="text-red-400 text-[14px]">{error}</p>
            <button onClick={() => { setError(null); hasStarted.current = false; setLog([]); }}
              className="h-10 px-5 rounded-xl bg-[#cbff00] text-[#08080c] text-[13px] font-semibold">
              Try again
            </button>
          </div>
        ) : (
          <p className="text-white/40 text-[14px]">Starting generation...</p>
        )}

        {/* Debug log */}
        <div className="w-full rounded-xl bg-black/50 border border-white/[0.06] p-3 max-h-[200px] overflow-y-auto">
          <p className="text-white/20 text-[9px] font-mono uppercase mb-1">debug</p>
          {log.map((l, i) => (
            <p key={i} className={`text-[10px] font-mono ${l.includes("ERROR") || l.includes("FATAL") ? "text-red-400" : l.includes("Task") ? "text-green-400" : "text-white/30"}`}>
              {l}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}
