import type { EmotionType } from "./types";

export interface EmotionConfig {
  id: EmotionType;
  label: string;
  emoji: string;
  colors: [string, string, string]; // gradient start, mid, end
  accent: string;
  sunoStyle: string;
  promptHint: string;
  description: string;
}

export const emotions: Record<EmotionType, EmotionConfig> = {
  love: {
    id: "love",
    label: "Love",
    emoji: "\u2764\ufe0f",
    colors: ["#ec4899", "#f43f5e", "#fb923c"],
    accent: "#ec4899",
    sunoStyle: "romantic ballad, warm vocals, acoustic",
    promptHint: "warmth, affection, deep connection",
    description: "For the ones who make your heart skip",
  },
  longing: {
    id: "longing",
    label: "Missing You",
    emoji: "\ud83e\ude90",
    colors: ["#8b5cf6", "#6366f1", "#3b82f6"],
    accent: "#8b5cf6",
    sunoStyle: "soulful, melancholic pop, soft",
    promptHint: "distance, yearning, memories",
    description: "When someone lives in your thoughts",
  },
  heartbreak: {
    id: "heartbreak",
    label: "Heartbreak",
    emoji: "\ud83d\udc94",
    colors: ["#6366f1", "#4338ca", "#1e1b4b"],
    accent: "#6366f1",
    sunoStyle: "sad ballad, emotional, minor key",
    promptHint: "pain, loss, letting go",
    description: "For the things left unsaid",
  },
  gratitude: {
    id: "gratitude",
    label: "Thank You",
    emoji: "\ud83d\ude4f",
    colors: ["#f59e0b", "#f97316", "#ef4444"],
    accent: "#f59e0b",
    sunoStyle: "uplifting, warm acoustic, hopeful",
    promptHint: "appreciation, thankfulness, warmth",
    description: "Because some people deserve more than words",
  },
  hype: {
    id: "hype",
    label: "Hype",
    emoji: "\ud83d\udd25",
    colors: ["#f97316", "#ef4444", "#eab308"],
    accent: "#f97316",
    sunoStyle: "energetic, upbeat pop, dance",
    promptHint: "energy, excitement, celebration",
    description: "Turn it up, let's celebrate",
  },
  calm: {
    id: "calm",
    label: "Peace",
    emoji: "\ud83c\udf3f",
    colors: ["#06b6d4", "#0d9488", "#10b981"],
    accent: "#06b6d4",
    sunoStyle: "ambient, lo-fi, chill, peaceful",
    promptHint: "serenity, stillness, comfort",
    description: "For quiet moments and gentle feelings",
  },
  nostalgia: {
    id: "nostalgia",
    label: "Nostalgia",
    emoji: "\ud83d\udcf7",
    colors: ["#a855f7", "#ec4899", "#f59e0b"],
    accent: "#a855f7",
    sunoStyle: "retro, dreamy, vintage pop",
    promptHint: "memories, old times, bittersweet",
    description: "Take me back to those days",
  },
  anger: {
    id: "anger",
    label: "Anger",
    emoji: "\ud83d\udca2",
    colors: ["#ef4444", "#dc2626", "#991b1b"],
    accent: "#ef4444",
    sunoStyle: "intense, rock, powerful vocals",
    promptHint: "frustration, intensity, raw emotion",
    description: "Some things need to be screamed",
  },
  hope: {
    id: "hope",
    label: "Hope",
    emoji: "\u2728",
    colors: ["#3b82f6", "#06b6d4", "#a855f7"],
    accent: "#3b82f6",
    sunoStyle: "inspiring, uplifting, orchestral pop",
    promptHint: "optimism, new beginnings, faith",
    description: "Brighter days are coming",
  },
};

export const emotionList = Object.values(emotions);
