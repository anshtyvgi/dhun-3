export type EmotionType =
  | "love"
  | "longing"
  | "heartbreak"
  | "gratitude"
  | "hype"
  | "calm"
  | "nostalgia"
  | "anger"
  | "hope";

export type RecipientType =
  | "myself"
  | "partner"
  | "crush"
  | "ex"
  | "friend"
  | "parents"
  | "boss"
  | "custom";

export type SongStatus = "pending" | "generating" | "completed" | "failed";

export interface Profile {
  id: string;
  display_name: string;
  avatar_url: string | null;
  phone: string | null;
  language: string;
  preferences: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface Song {
  id: string;
  user_id: string;
  batch_id: string | null;
  prompt_original: string;
  prompt_enhanced: string | null;
  recipient_type: RecipientType;
  emotion: EmotionType;
  status: SongStatus;
  suno_task_id: string | null;
  audio_url: string | null;
  lyrics: string | null;
  title: string | null;
  duration_seconds: number | null;
  style_tags: string[];
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface Card {
  id: string;
  song_id: string;
  user_id: string;
  from_name: string;
  to_name: string;
  message: string | null;
  emotion: EmotionType;
  recipient_type: RecipientType;
  background_url: string | null;
  visual_theme: Record<string, unknown>;
  is_premium: boolean;
  is_public: boolean;
  view_count: number;
  share_count: number;
  created_at: string;
  // Joined
  song?: Song;
}

export interface GenerationBatch {
  id: string;
  user_id: string;
  prompt_original: string;
  prompt_enhanced: string | null;
  recipient_type: RecipientType;
  emotion: EmotionType;
  status: string;
  created_at: string;
  songs?: Song[];
}

export interface Transaction {
  id: string;
  user_id: string;
  card_id: string | null;
  type: "download" | "share" | "extend";
  amount: number;
  status: string;
  created_at: string;
}
