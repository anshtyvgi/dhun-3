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

interface LogEntry {
  time: string;
  msg: string;
  type: "info" | "error" | "success";
}

export default function GeneratePage() {
  const router = useRouter();
  const store = useCreateStore();
  const [messageIdx, setMessageIdx] = useState(0);
  const [started, setStarted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [showDebug, setShowDebug] = useState(false);
  const pollRef = useRef<NodeJS.Timeout | null>(null);

  const emotionConfig = store.emotion ? emotions[store.emotion] : null;
  const colors = emotionConfig?.colors || ["#a855f7", "#ec4899", "#f97316"];

  const addLog = useCallback((msg: string, type: LogEntry["type"] = "info") => {
    const time = new Date().toLocaleTimeString();
    setLogs((prev) => [...prev, { time, msg, type }]);
  }, []);

  const startGeneration = useCallback(async () => {
    addLog("Starting generation...");
    addLog(`Emotion: ${store.emotion}, Recipient: ${store.recipient}`);
    addLog(`Prompt: "${store.promptText?.slice(0, 60) || "(empty)"}"`);
    addLog(`Enhanced: ${store.enhancedPrompt ? "yes" : "no"}`);

    try {
      const allChips = [
        ...store.moodChips,
        ...store.genreChips,
        ...store.languageChips,
        ...store.intentChips,
      ];

      addLog(`Chips: ${allChips.join(", ") || "(none)"}`);
      addLog("Calling /api/generate...");

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

      addLog(`Response status: ${res.status}`);
      const rawText = await res.text();
      let data;
      try {
        data = JSON.parse(rawText);
      } catch {
        const cleaned = rawText.replace(/[\x00-\x1f\x7f]/g, " ");
        data = JSON.parse(cleaned);
      }
      addLog(`Response: batchId=${data.batchId}, songs=${data.songs?.length}`);

      if (data.batchId) {
        addLog(`Batch created: ${data.batchId}`, "success");
        addLog(`Songs: ${data.songs?.length || 0}`);
        data.songs?.forEach((s: { suno_task_id?: string }, i: number) => {
          addLog(`  Song ${i + 1} taskId: ${s.suno_task_id || "unknown"}`);
        });
        store.setBatchId(data.batchId);
        // Collect task IDs for anonymous polling
        const taskIdList = data.songs?.map((s: { suno_task_id?: string }) => s.suno_task_id).filter(Boolean) || [];
        startPolling(data.batchId, taskIdList);
      } else {
        const errMsg = data.error || `HTTP ${res.status}`;
        addLog(`Generation failed: ${errMsg}`, "error");
        setError(errMsg);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Network error";
      addLog(`Exception: ${msg}`, "error");
      setError(msg);
    }
  }, [store, addLog]);

  const startPolling = (batchId: string, taskIdList: string[] = []) => {
    let pollCount = 0;
    addLog("Starting status polling every 4s...");

    pollRef.current = setInterval(async () => {
      pollCount++;
      try {
        // Use taskIds for anonymous mode, batchId for logged-in
        const isAnon = batchId.startsWith("anon");
        const url = isAnon && taskIdList.length > 0
          ? `/api/generate/status?taskIds=${taskIdList.join(",")}`
          : `/api/generate/status?batchId=${batchId}`;
        const res = await fetch(url);
        const rawText = await res.text();
        let data;
        try {
          data = JSON.parse(rawText);
        } catch {
          // Handle control characters in response
          const cleaned = rawText.replace(/[\x00-\x1f\x7f]/g, " ");
          data = JSON.parse(cleaned);
        }

        const completed = data.songs?.filter((s: { status: string }) => s.status === "completed") || [];
        const pending = data.songs?.filter((s: { status: string }) => s.status === "generating" || s.status === "pending") || [];
        const failed = data.songs?.filter((s: { status: string }) => s.status === "failed") || [];

        addLog(`Poll #${pollCount}: ${completed.length} done, ${pending.length} pending, ${failed.length} failed`);

        if (completed.length >= 1) {
          addLog(`Song ready! Navigating to results...`, "success");
          store.setSongs(data.songs);
          store.selectSong(completed[0].id);
          if (pollRef.current) clearInterval(pollRef.current);
          router.push("/create/results");
        }

        if (data.songs?.length > 0 && failed.length === data.songs.length) {
          addLog("All songs failed!", "error");
          if (pollRef.current) clearInterval(pollRef.current);
          setError("All songs failed to generate. Try again.");
        }
      } catch (err) {
        addLog(`Poll error: ${err}`, "error");
      }
    }, 3000);
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
      {/* Background blobs */}
      <div className="fixed inset-0 pointer-events-none">
        <div
          className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full blur-[150px] opacity-[0.12]"
          style={{ background: `radial-gradient(circle, ${colors[0]}, transparent 70%)` }}
        />
        <div
          className="absolute bottom-1/4 left-1/4 w-[350px] h-[350px] rounded-full blur-[120px] opacity-[0.08]"
          style={{ background: `radial-gradient(circle, ${colors[1]}, transparent 70%)` }}
        />
      </div>

      <div className="relative z-10 flex flex-col items-center space-y-8 px-6 w-full max-w-[400px]">
        {/* Waveform */}
        {!error && (
          <div className="flex items-end gap-[5px] h-20">
            {Array.from({ length: 12 }).map((_, i) => (
              <motion.div
                key={i}
                className="w-[5px] rounded-full"
                style={{ background: `linear-gradient(to top, ${colors[0]}, ${colors[2]})` }}
                animate={{ height: ["20%", `${40 + Math.random() * 60}%`, "20%"] }}
                transition={{ duration: 1 + Math.random() * 0.5, repeat: Infinity, delay: i * 0.1, ease: "easeInOut" }}
              />
            ))}
          </div>
        )}

        {/* Status message or error */}
        {error ? (
          <div className="space-y-4 text-center w-full">
            <div className="w-14 h-14 rounded-full bg-red-500/[0.10] flex items-center justify-center mx-auto">
              <span className="text-2xl">!</span>
            </div>
            <p className="text-red-400 text-[15px] font-medium">{error}</p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => { setError(null); setStarted(false); setLogs([]); }}
                className="h-10 px-5 rounded-xl bg-[#cbff00] text-[#08080c] text-[13px] font-semibold"
              >
                Try again
              </button>
              <button
                onClick={() => router.push("/create/prompt")}
                className="h-10 px-5 rounded-xl bg-white/[0.06] text-white/50 text-[13px] font-medium"
              >
                Go back
              </button>
            </div>
          </div>
        ) : (
          <>
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
            <p className="text-white/20 text-[13px] text-center">
              This usually takes 30–60 seconds
            </p>
          </>
        )}

        {/* Dev Debug Toggle */}
        <button
          onClick={() => setShowDebug(!showDebug)}
          className="text-white/15 text-[11px] font-mono hover:text-white/30 transition-colors"
        >
          {showDebug ? "hide" : "show"} debug logs ({logs.length})
        </button>

        {/* Debug Panel */}
        {showDebug && (
          <div className="w-full rounded-xl bg-black/60 border border-white/[0.06] p-4 max-h-[300px] overflow-y-auto">
            <p className="text-white/30 text-[10px] font-mono uppercase tracking-wider mb-2">Dev Logs</p>
            <div className="space-y-1">
              {logs.map((log, i) => (
                <p
                  key={i}
                  className={`text-[11px] font-mono leading-relaxed ${
                    log.type === "error" ? "text-red-400" :
                    log.type === "success" ? "text-green-400" :
                    "text-white/40"
                  }`}
                >
                  <span className="text-white/20">[{log.time}]</span> {log.msg}
                </p>
              ))}
              {logs.length === 0 && (
                <p className="text-white/20 text-[11px] font-mono">Waiting...</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
