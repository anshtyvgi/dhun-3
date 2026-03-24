"use client";

import { cn } from "@/lib/utils";
import { forwardRef, type TextareaHTMLAttributes } from "react";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm text-dhun-text-muted mb-2">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          className={cn(
            "w-full bg-dhun-surface border border-dhun-border rounded-xl px-4 py-3 text-dhun-text",
            "placeholder:text-dhun-text-muted/50 outline-none transition-all duration-200 resize-none",
            "focus:border-dhun-accent-purple/50 focus:shadow-[0_0_20px_rgba(168,85,247,0.15)]",
            error && "border-red-500/50",
            className
          )}
          {...props}
        />
        {error && <p className="text-red-400 text-sm mt-1">{error}</p>}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";
