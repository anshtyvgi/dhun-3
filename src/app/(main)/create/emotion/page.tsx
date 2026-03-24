"use client";

import { useCreateStore } from "@/stores/create-store";
import { emotionList } from "@/lib/emotions";
import { recipients } from "@/lib/recipients";
import { useEmotionTheme } from "@/providers/theme-provider";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function EmotionPage() {
  const router = useRouter();
  const { recipient, emotion, setEmotion } = useCreateStore();
  const { setCurrentEmotion } = useEmotionTheme();

  useEffect(() => {
    if (!recipient) router.replace("/create/recipient");
  }, [recipient, router]);

  const handleSelect = (emotionId: typeof emotion) => {
    if (!emotionId) return;
    setEmotion(emotionId);
    setCurrentEmotion(emotionId);
  };

  const recipientLabel = recipient ? recipients[recipient].label : "";
  const selectedConfig = emotion
    ? emotionList.find((e) => e.id === emotion)
    : null;

  return (
    <div className="min-h-screen relative pb-28" style={{ background: "#08080c" }}>
      {/* Dynamic background glow */}
      <div className="fixed inset-0 pointer-events-none transition-all duration-1000">
        {selectedConfig ? (
          <>
            <div
              className="absolute -top-20 -right-20 w-[400px] h-[400px] rounded-full blur-[120px] transition-all duration-1000"
              style={{
                background: `radial-gradient(circle, ${selectedConfig.colors[0]}18, ${selectedConfig.colors[1]}0c, transparent)`,
              }}
            />
            <div
              className="absolute bottom-40 -left-20 w-[300px] h-[300px] rounded-full blur-[100px] transition-all duration-1000"
              style={{
                background: `radial-gradient(circle, ${selectedConfig.colors[1]}10, ${selectedConfig.colors[2]}08, transparent)`,
              }}
            />
          </>
        ) : (
          <div className="absolute top-20 right-0 w-[300px] h-[300px] rounded-full bg-purple-500/[0.04] blur-[100px]" />
        )}
      </div>

      <div className="relative z-10 px-6 pt-16 space-y-8">
        {/* Step indicator - step 2 of 5 */}
        <div className="flex gap-1.5">
          {[1, 2, 3, 4, 5].map((step) => (
            <div
              key={step}
              className={cn(
                "h-[3px] rounded-full transition-all duration-500",
                step <= 2
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
          transition={{ duration: 0.5 }}
          className="space-y-2"
        >
          <h1 className="text-[28px] font-bold tracking-tight leading-tight text-white">
            What do you feel
            {recipientLabel ? (
              <>
                <br />
                <span className="text-white/40">for {recipientLabel}?</span>
              </>
            ) : (
              <span className="text-white/40">?</span>
            )}
          </h1>
        </motion.div>

        {/* Emotion grid - 2 columns */}
        <div className="grid grid-cols-2 gap-3">
          {emotionList.map((e, i) => {
            const isSelected = emotion === e.id;
            return (
              <motion.button
                key={e.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.04 * i, duration: 0.4 }}
                onClick={() => handleSelect(e.id)}
                className={cn(
                  "relative overflow-hidden rounded-2xl p-5 text-left transition-all duration-300 border",
                  isSelected
                    ? "border-transparent"
                    : "bg-white/[0.04] border-white/[0.06] hover:bg-white/[0.06]"
                )}
                style={
                  isSelected
                    ? {
                        background: `linear-gradient(135deg, ${e.colors[0]}20, ${e.colors[1]}12, transparent)`,
                        borderColor: `${e.accent}40`,
                      }
                    : undefined
                }
              >
                {/* Checkmark top-right */}
                {isSelected && (
                  <div
                    className="absolute top-3 right-3 w-5 h-5 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: e.accent }}
                  >
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="white"
                      strokeWidth="3"
                      strokeLinecap="round"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                )}
                <div className="space-y-3">
                  <span className="text-3xl">{e.emoji}</span>
                  <div>
                    <p className="font-semibold text-sm text-white">
                      {e.label}
                    </p>
                    <p className="text-white/30 text-xs mt-0.5 leading-relaxed">
                      {e.description}
                    </p>
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Fixed bottom: Back (ghost) + Continue (accent) */}
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
            onClick={() => router.push("/create/prompt")}
            disabled={!emotion}
            className={cn(
              "flex-1 h-[56px] rounded-2xl font-semibold text-base transition-all duration-300",
              emotion
                ? "bg-[#cbff00] text-[#08080c] shadow-[0_0_40px_rgba(203,255,0,0.15)]"
                : "bg-white/[0.05] text-white/20 cursor-not-allowed"
            )}
          >
            Continue
          </motion.button>
        </div>
      </div>
    </div>
  );
}
