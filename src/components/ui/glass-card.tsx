"use client";

import { cn } from "@/lib/utils";
import { motion, type HTMLMotionProps } from "framer-motion";

interface GlassCardProps extends HTMLMotionProps<"div"> {
  glow?: boolean;
  hoverable?: boolean;
}

export function GlassCard({
  glow,
  hoverable,
  className,
  children,
  ...props
}: GlassCardProps) {
  return (
    <motion.div
      whileHover={hoverable ? { scale: 1.02, y: -2 } : undefined}
      whileTap={hoverable ? { scale: 0.98 } : undefined}
      className={cn(
        "glass rounded-2xl p-4",
        glow && "animate-pulse-glow",
        hoverable && "cursor-pointer",
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
}
