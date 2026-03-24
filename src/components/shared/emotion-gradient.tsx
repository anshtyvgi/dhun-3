"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface EmotionGradientProps {
  colors?: [string, string, string];
  className?: string;
  animate?: boolean;
}

export function EmotionGradient({
  colors = ["#a855f7", "#ec4899", "#f97316"],
  className,
  animate = true,
}: EmotionGradientProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
      className={cn("absolute inset-0 overflow-hidden pointer-events-none", className)}
    >
      <div
        className={cn(
          "absolute -top-1/2 -left-1/2 w-[200%] h-[200%]",
          animate && "animate-gradient"
        )}
        style={{
          background: `radial-gradient(ellipse at 30% 20%, ${colors[0]}20 0%, transparent 50%),
                       radial-gradient(ellipse at 70% 60%, ${colors[1]}15 0%, transparent 50%),
                       radial-gradient(ellipse at 40% 80%, ${colors[2]}10 0%, transparent 50%)`,
        }}
      />
    </motion.div>
  );
}
