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

interface LogEntry { time: string; msg: string; type: "info" | "error" | "success"; }
interface SongResponse { suno_task_id?: string; status?: string; error?: string; }

export default function GeneratePage() {
  const router = useRouter();
  const store = useCreateStore();
  const [messageIdx, setMessageIdx] = useState(0);
  const [started, setStarted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [showDebug, setShowDebug] = useState(true); // Auto-open for debugging
  const pollRef = useRef<NodeJS.Timeout | null>(null);

  const emotionConfig = store.emotion ? emotions[store.emotion] : null;
  const colors = emotionConfig?.colors || ["#a855f7", "#ec4899", "#f97316"];

  const addLog = useCallback((msg: string, type: LogEntry["type"] = "info") => {
    setLogs((prev) => [...prev, { time: new Date().toLocaleTimeString(), msg, type }]);
  }, []);

  const startGeneration = useCallback(async () => {
    addLog("Starting generation...");
    addLog(`Emotion: ${store.emotion}, Recipient: ${store.recipient}`);

    try {
      const allChips = [...store.moodChips, ...store.genreChips, ...store.languageChips, ...store.intentChips];
      const body = {
        promptText: store.promptText,
        enhancedPrompt: store.enhancedPrompt,
        chips: allChips,
        emotion: store.emotion,
        recipientType: store.recipient,
      };

      addLog("POST /api/generate");
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      addLog(`Status: ${res.status}`);
      const rawText = await res.text();

      let data;
      try {
        data = JSON.parse(rawText);
      } catch {
        data = JSON.parse(rawText.replace(/[\x00-\x1f\x7f]/g, " "));
      }

      // Extract valid task IDs
      const songs: SongResponse[] = data.songs || [];
      const validTasks = songs.filter((s) => s.suno_task_id && s.status !== "failed");
      const failedSongs = songs.filter((s) => s.status === "failed");

      addLog(`Songs: ${songs.length} total, ${validTasks.length} valid, ${failedSongs.length} failed`);

      // Show errors from failed songs
      failedSongs.forEach((s, i) => {
        addLog(`Song error: ${s.error || "unknown"}`, "error");
      });

      validTasks.forEach((s, i) => {
        addLog(`Task ${i + 1}: ${s.suno_task_id}`, "success");
      });

      if (validTasks.length === 0) {
        const firstError = failedSongs[0]?.error || data.error || "All songs failed";
        setError(firstError);
        addLog(`FATAL: ${firstError}`, "error");
        return;
      }

      store.setBatchId(data.batchId || "batch");
      const taskIds = validTasks.map((s) => s.suno_task_id!);
      startPolling(taskIds);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Network error";
      addLog(`Exception: ${msg}`, "error");
      setError(msg);
    }
  }, [store, addLog]);

  const startPolling = (taskIds: string[]) => {
    let pollCount = 0;
    addLog(`Polling ${taskIds.length} tasks every 3s...`);

    pollRef.current = setInterval(async () => {
      pollCount++;
      try {
        const url = `/api/generate/status?taskIds=${taskIds.join(",")}`;
        const res = await fetch(url);
        const rawText = await res.text();
        let data;
        try { data = JSON.parse(rawText); }
        catch { data = JSON.parse(rawText.replace(/[\x00-\x1f\x7f]/g, " ")); }

        const completed = data.songs?.filter((s: { status: string }) => s.status === "completed") || [];
        const pending = data.songs?.filter((s: { status: string }) => s.status === "generating" || s.status === "pending") || [];

        addLog(`Poll #${pollCount}: ${completed.length} ready, ${pending.length} waiting`);

        if (completed.length >= 1) {
          addLog(`DONE! "${completed[0].title}" — navigating...`, "success");
          store.setSongs(data.songs);
          store.selectSong(completed[0].id);
          if (pollRef.current) clearInterval(pollRef.current);
          setTimeout(() => router.push("/create/results"), 500);
        }
      } catch (err) {
        addLog(`Poll error: ${err}`, "error");
      }
    }, 3000);
  };

  useEffect(() => {
    if (!store.emotion) { router.replace("/create/prompt"); return; }
    if (!started) { setStarted(true); startGeneration(); }
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [store.emotion, router, started, startGeneration]);

  useEffect(() => {
    const interval = setInterval(() => setMessageIdx((i) => (i + 1) % LOADING_MESSAGES.length), 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen relative flex flex-col items-center justify-center overflow-hidden" style={{ background: "#08080c" }}>
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full blur-[150px] opacity-[0.12]" style={{ background: `radial-gradient(circle, ${colors[0]}, transparent 70%)` }} />
      </div>

      <div className="relative z-10 flex flex-col items-center space-y-6 px-6 w-full max-w-[400px]">
        {/* Waveform */}
        {!error && (
          <div className="flex items-end gap-[5px] h-16">
            {Array.from({ length: 12 }).map((_, i) => (
              <motion.div key={i} className="w-[4px] rounded-full"
                style={{ background: `linear-gradient(to top, ${colors[0]}, ${colors[2]})` }}
                animate={{ height: ["20%", `${40 + Math.random() * 60}%`, "20%"] }}
                transition={{ duration: 1 + Math.random() * 0.5, repeat: Infinity, delay: i * 0.1, ease: "easeInOut" }}
              />
            ))}
          </div>
        )}

        {/* Status or error */}
        {error ? (
          <div className="space-y-4 text-center w-full">
            <p className="text-red-400 text-[14px] font-medium">{error}</p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => { setError(null); setStarted(false); setLogs([]); }}
                className="h-10 px-5 rounded-xl bg-[#cbff00] text-[#08080c] text-[13px] font-semibold">
                Try again
              </button>
              <button onClick={() => router.push("/create/prompt")}
                className="h-10 px-5 rounded-xl bg-white/[0.06] text-white/50 text-[13px]">
                Go back
              </button>
            </div>
          </div>
        ) : (
          <>
            <AnimatePresence mode="wait">
              <motion.p key={messageIdx} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                className="text-lg font-medium text-center text-white">
                {LOADING_MESSAGES[messageIdx]}
              </motion.p>
            </AnimatePresence>
            <p className="text-white/20 text-[13px]">Takes 30–60 seconds</p>
          </>
        )}

        {/* Debug panel — always visible */}
        <div className="w-full">
          <button onClick={() => setShowDebug(!showDebug)}
            className="text-white/20 text-[11px] font-mono mb-2">
            {showDebug ? "▼" : "▶"} debug ({logs.length})
          </button>
          {showDebug && (
            <div className="w-full rounded-xl bg-black/60 border border-white/[0.06] p-3 max-h-[250px] overflow-y-auto">
              {logs.map((log, i) => (
                <p key={i} className={`text-[10px] font-mono leading-relaxed ${
                  log.type === "error" ? "text-red-400" : log.type === "success" ? "text-green-400" : "text-white/40"
                }`}>
                  <span className="text-white/15">[{log.time}]</span> {log.msg}
                </p>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
