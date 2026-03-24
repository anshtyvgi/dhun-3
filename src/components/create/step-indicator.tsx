"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

export function StepIndicator({ currentStep, totalSteps }: StepIndicatorProps) {
  return (
    <div className="flex gap-2">
      {Array.from({ length: totalSteps }, (_, i) => (
        <motion.div
          key={i}
          className={cn(
            "h-1 rounded-full transition-all duration-300",
            i + 1 === currentStep
              ? "bg-gradient-to-r from-dhun-accent-purple to-dhun-accent-pink flex-[2]"
              : i + 1 < currentStep
                ? "bg-dhun-accent-purple/50 flex-1"
                : "bg-dhun-border flex-1"
          )}
          layout
        />
      ))}
    </div>
  );
}
