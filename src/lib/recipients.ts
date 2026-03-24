import type { EmotionType, RecipientType } from "./types";

export interface RecipientConfig {
  id: RecipientType;
  label: string;
  icon: string;
  toneModifier: string;
  defaultEmotion: EmotionType;
  description: string;
}

export const recipients: Record<RecipientType, RecipientConfig> = {
  myself: {
    id: "myself",
    label: "Myself",
    icon: "\ud83e\uddd1",
    toneModifier: "self-reflective, introspective, personal journal style",
    defaultEmotion: "calm",
    description: "A song for your soul",
  },
  partner: {
    id: "partner",
    label: "Partner",
    icon: "\ud83d\udc91",
    toneModifier: "deeply romantic, intimate, devotional",
    defaultEmotion: "love",
    description: "For your other half",
  },
  crush: {
    id: "crush",
    label: "Crush",
    icon: "\ud83e\ude77",
    toneModifier: "shy, flirty, nervous excitement, butterflies",
    defaultEmotion: "love",
    description: "For the one who gives you butterflies",
  },
  ex: {
    id: "ex",
    label: "Ex",
    icon: "\ud83d\udc4b",
    toneModifier: "bittersweet, reflective, closure",
    defaultEmotion: "heartbreak",
    description: "Things you never said",
  },
  friend: {
    id: "friend",
    label: "Friend",
    icon: "\ud83e\udd1d",
    toneModifier: "warm, fun, brotherly/sisterly bond",
    defaultEmotion: "gratitude",
    description: "For your ride-or-die",
  },
  parents: {
    id: "parents",
    label: "Parents",
    icon: "\ud83c\udfe0",
    toneModifier: "respectful, emotional, grateful, deep love",
    defaultEmotion: "gratitude",
    description: "For the ones who gave you everything",
  },
  boss: {
    id: "boss",
    label: "Boss / Mentor",
    icon: "\ud83d\udcbc",
    toneModifier: "professional yet heartfelt, appreciative",
    defaultEmotion: "gratitude",
    description: "For someone who shaped your journey",
  },
  custom: {
    id: "custom",
    label: "Someone Else",
    icon: "\u2728",
    toneModifier: "adaptable, sincere",
    defaultEmotion: "love",
    description: "Tell us who",
  },
};

export const recipientList = Object.values(recipients);
