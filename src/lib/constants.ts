export const APP_NAME = "Dhun";
export const APP_TAGLINE = "Send what you feel, as a song";
export const APP_DESCRIPTION = "Turn feelings into shareable music experiences";

export const PRICING = {
  download: 25,
  share: 9,
  extend: 5,
} as const;

export const MOOD_CHIPS = [
  "Happy",
  "Melancholic",
  "Bittersweet",
  "Peaceful",
  "Intense",
  "Playful",
  "Dreamy",
  "Raw",
] as const;

export const GENRE_CHIPS = [
  "Bollywood",
  "Lo-fi",
  "Acoustic",
  "Pop",
  "R&B",
  "Classical",
  "Hip Hop",
  "Indie",
] as const;

export const LANGUAGE_CHIPS = [
  "Hindi",
  "English",
  "Hinglish",
  "Punjabi",
  "Tamil",
  "Telugu",
] as const;

export const INTENT_CHIPS = [
  "Confession",
  "Apology",
  "Celebration",
  "Farewell",
  "Just Because",
  "Anniversary",
  "Birthday",
  "Encouragement",
] as const;

export const QUICK_PROMPTS = [
  { label: "Missing someone", emoji: "\ud83e\ude90", emotion: "longing" as const },
  { label: "Thank you", emoji: "\ud83d\ude4f", emotion: "gratitude" as const },
  { label: "I'm sorry", emoji: "\ud83e\ude79", emotion: "heartbreak" as const },
  { label: "Celebrate!", emoji: "\ud83c\udf89", emotion: "hype" as const },
  { label: "Just vibing", emoji: "\ud83c\udf3f", emotion: "calm" as const },
  { label: "I love you", emoji: "\u2764\ufe0f", emotion: "love" as const },
  { label: "Remember when", emoji: "\ud83d\udcf7", emotion: "nostalgia" as const },
  { label: "New beginnings", emoji: "\u2728", emotion: "hope" as const },
] as const;

export const DAILY_SUGGESTIONS = [
  "Who made you smile today?",
  "Someone on your mind?",
  "What are you grateful for?",
  "Send a surprise to someone you love",
  "Tell your best friend how you feel",
  "Your mom would love to hear from you",
  "Turn today's mood into a song",
  "Dedicate a song to yourself today",
];
