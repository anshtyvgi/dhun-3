"use client";

import { useCreateStore } from "@/stores/create-store";
import { recipientList } from "@/lib/recipients";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function RecipientPage() {
  const router = useRouter();
  const { recipient, setRecipient, customRecipientName, setCustomRecipientName } =
    useCreateStore();

  const handleNext = () => {
    if (!recipient) return;
    router.push("/create/emotion");
  };

  return (
    <div className="min-h-screen relative pb-44">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-20 right-0 w-[300px] h-[300px] rounded-full bg-purple-500/[0.05] blur-[100px]" />
      </div>

      <div className="relative z-10 px-6 pt-16 space-y-8">
        {/* Step indicator */}
        <div className="flex gap-1.5">
          {[1, 2, 3, 4, 5].map((step) => (
            <div
              key={step}
              className={cn(
                "h-[3px] rounded-full transition-all duration-500",
                step === 1 ? "flex-[2] bg-gradient-to-r from-purple-500 to-pink-500" : "flex-1 bg-white/[0.06]"
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
          <h1 className="text-[28px] font-bold tracking-tight leading-tight">
            Who is this<br />
            <span className="text-white/50">song for?</span>
          </h1>
        </motion.div>

        {/* Recipient grid */}
        <div className="grid grid-cols-2 gap-3">
          {recipientList.map((r, i) => (
            <motion.button
              key={r.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * i, duration: 0.4 }}
              onClick={() => setRecipient(r.id)}
              className={cn(
                "relative overflow-hidden rounded-2xl p-5 text-left transition-all duration-300 border",
                recipient === r.id
                  ? "bg-purple-500/[0.12] border-purple-500/30 shadow-[0_0_30px_rgba(168,85,247,0.1)]"
                  : "bg-white/[0.03] border-white/[0.06] hover:bg-white/[0.06] hover:border-white/[0.1]"
              )}
            >
              {recipient === r.id && (
                <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-purple-500 flex items-center justify-center">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
              )}
              <div className="space-y-3">
                <span className="text-3xl">{r.icon}</span>
                <div>
                  <p className="font-semibold text-sm text-white">{r.label}</p>
                  <p className="text-white/30 text-xs mt-0.5 leading-relaxed">{r.description}</p>
                </div>
              </div>
            </motion.button>
          ))}
        </div>

        {/* Custom name input */}
        {recipient === "custom" && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
          >
            <input
              placeholder="Their name..."
              value={customRecipientName}
              onChange={(e) => setCustomRecipientName(e.target.value)}
              className="w-full rounded-2xl bg-white/[0.05] border border-white/[0.08] px-5 py-4 text-white placeholder:text-white/25 outline-none transition-all focus:border-purple-500/30 focus:shadow-[0_0_20px_rgba(168,85,247,0.1)]"
            />
          </motion.div>
        )}
      </div>

      {/* Fixed bottom CTA */}
      <div className="fixed bottom-24 left-1/2 -translate-x-1/2 w-full max-w-[430px] px-6 z-20">
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleNext}
          disabled={!recipient}
          className={cn(
            "w-full py-4 rounded-2xl font-semibold text-base transition-all duration-300",
            recipient
              ? "bg-[#cbff00] text-[#08080c] shadow-[0_0_40px_rgba(203,255,0,0.15)]"
              : "bg-white/[0.05] text-white/20 cursor-not-allowed"
          )}
        >
          Continue
        </motion.button>
      </div>
    </div>
  );
}
