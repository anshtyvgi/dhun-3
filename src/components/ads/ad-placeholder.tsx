"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface AdPlaceholderProps {
  variant?: "banner" | "interstitial";
  className?: string;
  onClose?: () => void;
}

export function AdPlaceholder({
  variant = "banner",
  className,
  onClose,
}: AdPlaceholderProps) {
  if (variant === "interstitial") {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-6"
      >
        <div className="glass-strong rounded-2xl p-6 w-full max-w-sm space-y-4 text-center">
          <div className="text-xs text-dhun-text-muted uppercase tracking-wider">
            Ad
          </div>
          <div className="h-48 rounded-xl bg-gradient-to-br from-dhun-accent-purple/10 to-dhun-accent-pink/10 flex items-center justify-center">
            <p className="text-dhun-text-muted text-sm">Sponsor Area</p>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="text-dhun-text-muted text-sm hover:text-dhun-text transition-colors"
            >
              Skip in 5s
            </button>
          )}
        </div>
      </motion.div>
    );
  }

  return (
    <div
      className={cn(
        "glass rounded-xl p-3 flex items-center justify-center",
        className
      )}
    >
      <div className="flex items-center gap-2">
        <span className="text-[10px] text-dhun-text-muted uppercase tracking-wider px-1.5 py-0.5 rounded border border-dhun-border">
          Ad
        </span>
        <span className="text-dhun-text-muted text-xs">Sponsor Area</span>
      </div>
    </div>
  );
}
