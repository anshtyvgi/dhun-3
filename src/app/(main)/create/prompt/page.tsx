"use client";

import { useCreateStore } from "@/stores/create-store";
import {
  MOOD_CHIPS,
  GENRE_CHIPS,
  LANGUAGE_CHIPS,
  INTENT_CHIPS,
} from "@/lib/constants";
import { emotions } from "@/lib/emotions";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export default function PromptPage() {
  const router = useRouter();
  const store = useCreateStore();
  const [enhancing, setEnhancing] = useState(false);

  useEffect(() => {
    if (!store.emotion) router.replace("/create/emotion");
  }, [store.emotion, router]);

  const emotionConfig = store.emotion ? emotions[store.emotion] : null;
  const accent = emotionConfig?.accent || "#a855f7";

  const handleEnhance = async () => {
    setEnhancing(true);
    try {
      const allChips = [
        ...store.moodChips,
        ...store.genreChips,
        ...store.languageChips,
        ...store.intentChips,
      ];

      const res = await fetch("/api/enhance-prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          promptText: store.promptText,
          chips: allChips,
          emotion: store.emotion,
          recipientType: store.recipient,
        }),
      });

      const data = await res.json();
      if (data.enhancedPrompt) {
        store.setEnhancedPrompt(data.enhancedPrompt);
      }
    } catch (err) {
      console.error("Enhance failed:", err);
    }
    setEnhancing(false);
  };

  return (
    <div
      className="min-h-screen relative pb-28"
      style={{ background: "#08080c" }}
    >
      {/* Background glows */}
      <div className="fixed inset-0 pointer-events-none">
        {emotionConfig && (
          <>
            <div
              className="absolute -top-20 -right-20 w-[400px] h-[400px] rounded-full blur-[120px]"
              style={{
                background: `radial-gradient(circle, ${emotionConfig.colors[0]}10, transparent)`,
              }}
            />
            <div
              className="absolute bottom-40 -left-20 w-[300px] h-[300px] rounded-full blur-[100px]"
              style={{
                background: `radial-gradient(circle, ${emotionConfig.colors[1]}08, transparent)`,
              }}
            />
          </>
        )}
      </div>

      <div className="relative z-10 px-6 pt-16 space-y-7">
        {/* Step indicator - step 3 of 5 */}
        <div className="flex gap-1.5">
          {[1, 2, 3, 4, 5].map((step) => (
            <div
              key={step}
              className={cn(
                "h-[3px] rounded-full transition-all duration-500",
                step <= 3
                  ? "flex-[2] bg-gradient-to-r from-purple-500 to-pink-500"
                  : "flex-1 bg-white/[0.04]"
              )}
            />
          ))}
        </div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2"
        >
          <h1 className="text-[28px] font-bold tracking-tight leading-tight text-white">
            Build your
            <br />
            <span className="text-white/40">prompt</span>
          </h1>
          <p className="text-white/40 text-[13px]">
            Pick tags and describe your feeling
          </p>
        </motion.div>

        {/* Chip sections */}
        <ChipSection
          title="Mood"
          chips={MOOD_CHIPS}
          selected={store.moodChips}
          onToggle={store.toggleMoodChip}
          accent={accent}
        />
        <ChipSection
          title="Genre"
          chips={GENRE_CHIPS}
          selected={store.genreChips}
          onToggle={store.toggleGenreChip}
          accent={accent}
        />
        <ChipSection
          title="Language"
          chips={LANGUAGE_CHIPS}
          selected={store.languageChips}
          onToggle={store.toggleLanguageChip}
          accent={accent}
        />
        <ChipSection
          title="Intent"
          chips={INTENT_CHIPS}
          selected={store.intentChips}
          onToggle={store.toggleIntentChip}
          accent={accent}
        />

        {/* Free text textarea */}
        <div className="space-y-2">
          <p className="text-white/40 text-xs font-medium uppercase tracking-wider">
            Your words
          </p>
          <textarea
            placeholder="Tell us more... a memory, a feeling, a name, a moment..."
            value={store.promptText}
            onChange={(e) => store.setPromptText(e.target.value)}
            rows={4}
            className="w-full rounded-2xl bg-white/[0.04] border border-white/[0.06] px-5 py-4 text-white text-[15px] placeholder:text-white/20 outline-none transition-all duration-300 resize-none focus:bg-white/[0.06] focus:border-white/[0.12] leading-relaxed"
          />
        </div>

        {/* Enhance with AI button */}
        <button
          onClick={handleEnhance}
          disabled={enhancing}
          className="w-full h-[48px] rounded-2xl bg-white/[0.04] border border-white/[0.06] text-white/70 font-medium text-sm flex items-center justify-center gap-2 transition-all hover:bg-white/[0.08] hover:text-white disabled:opacity-50"
        >
          {enhancing ? (
            <>
              <svg
                className="animate-spin h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              Enhancing...
            </>
          ) : (
            <>Enhance with AI</>
          )}
        </button>

        {/* Enhanced prompt preview */}
        {store.enhancedPrompt && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl bg-white/[0.04] border border-white/[0.06] p-5 space-y-2"
          >
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-400" />
              <p className="text-green-400/80 text-xs font-medium">
                AI Enhanced
              </p>
            </div>
            <p className="text-white/70 text-[13px] leading-relaxed">
              {store.enhancedPrompt}
            </p>
          </motion.div>
        )}

        <div className="h-8" />
      </div>

      {/* Fixed bottom: Back + Create my song */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-[430px] px-6 z-20">
        <div className="flex gap-3">
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => router.back()}
            className="h-[56px] px-6 rounded-2xl bg-transparent border border-white/[0.08] text-white/60 font-medium transition-all hover:bg-white/[0.05]"
          >
            Back
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => router.push("/create/generate")}
            className="flex-1 h-[56px] rounded-2xl bg-[#cbff00] text-[#08080c] font-semibold text-base shadow-[0_0_40px_rgba(203,255,0,0.15)] transition-all active:scale-[0.98]"
          >
            Create my song
          </motion.button>
        </div>
      </div>
    </div>
  );
}

function ChipSection({
  title,
  chips,
  selected,
  onToggle,
  accent,
}: {
  title: string;
  chips: readonly string[];
  selected: string[];
  onToggle: (chip: string) => void;
  accent: string;
}) {
  return (
    <div className="space-y-2.5">
      <p className="text-white/40 text-xs font-medium uppercase tracking-wider">
        {title}
      </p>
      <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-6 px-6">
        {chips.map((chip) => {
          const isSelected = selected.includes(chip);
          return (
            <button
              key={chip}
              onClick={() => onToggle(chip)}
              className={cn(
                "flex-shrink-0 h-9 px-4 rounded-full text-[13px] font-medium transition-all duration-200 whitespace-nowrap border",
                isSelected
                  ? ""
                  : "bg-white/[0.04] border-white/[0.06] text-white/40 hover:bg-white/[0.06] hover:text-white/60"
              )}
              style={
                isSelected
                  ? {
                      background: `${accent}26`,
                      borderColor: `${accent}4d`,
                      color: accent,
                    }
                  : undefined
              }
            >
              {chip}
            </button>
          );
        })}
      </div>
    </div>
  );
}
