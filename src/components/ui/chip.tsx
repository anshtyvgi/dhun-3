"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface ChipProps {
  label: string;
  selected?: boolean;
  onSelect?: () => void;
  emoji?: string;
  className?: string;
}

export function Chip({ label, selected, onSelect, emoji, className }: ChipProps) {
  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={onSelect}
      className={cn(
        "px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap",
        selected
          ? "bg-gradient-to-r from-dhun-accent-purple to-dhun-accent-pink text-white"
          : "glass text-dhun-text-muted hover:text-dhun-text hover:bg-white/10",
        className
      )}
    >
      {emoji && <span className="mr-1.5">{emoji}</span>}
      {label}
    </motion.button>
  );
}
