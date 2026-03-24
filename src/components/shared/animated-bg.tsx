"use client";

import { cn } from "@/lib/utils";

interface AnimatedBgProps {
  className?: string;
}

export function AnimatedBg({ className }: AnimatedBgProps) {
  return (
    <div className={cn("fixed inset-0 pointer-events-none z-0", className)}>
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-dhun-accent-purple/5 rounded-full blur-[120px] animate-breathe" />
      <div
        className="absolute bottom-1/4 right-0 w-80 h-80 bg-dhun-accent-pink/5 rounded-full blur-[100px] animate-breathe"
        style={{ animationDelay: "2s" }}
      />
      <div
        className="absolute top-1/2 left-0 w-72 h-72 bg-dhun-accent-blue/5 rounded-full blur-[100px] animate-breathe"
        style={{ animationDelay: "4s" }}
      />
    </div>
  );
}
