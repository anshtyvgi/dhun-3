"use client";

import { emotions } from "@/lib/emotions";
import type { EmotionType } from "@/lib/types";
import { createContext, useContext, useState, type ReactNode } from "react";

interface ThemeContextType {
  currentEmotion: EmotionType | null;
  setCurrentEmotion: (emotion: EmotionType | null) => void;
  colors: [string, string, string];
  accent: string;
}

const defaultColors: [string, string, string] = ["#a855f7", "#ec4899", "#f97316"];

const ThemeContext = createContext<ThemeContextType>({
  currentEmotion: null,
  setCurrentEmotion: () => {},
  colors: defaultColors,
  accent: "#a855f7",
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [currentEmotion, setCurrentEmotion] = useState<EmotionType | null>(null);

  const emotionConfig = currentEmotion ? emotions[currentEmotion] : null;
  const colors = emotionConfig?.colors ?? defaultColors;
  const accent = emotionConfig?.accent ?? "#a855f7";

  return (
    <ThemeContext.Provider value={{ currentEmotion, setCurrentEmotion, colors, accent }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useEmotionTheme() {
  return useContext(ThemeContext);
}
