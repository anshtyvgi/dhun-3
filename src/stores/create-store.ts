import { create } from "zustand";
import type { EmotionType, RecipientType, Song } from "@/lib/types";

interface CreateFlowState {
  step: 1 | 2 | 3 | 4 | 5;
  recipient: RecipientType | null;
  customRecipientName: string;
  emotion: EmotionType | null;
  moodChips: string[];
  genreChips: string[];
  languageChips: string[];
  intentChips: string[];
  promptText: string;
  enhancedPrompt: string | null;
  batchId: string | null;
  songs: Song[];
  selectedSongId: string | null;

  // Actions
  setRecipient: (r: RecipientType) => void;
  setCustomRecipientName: (name: string) => void;
  setEmotion: (e: EmotionType) => void;
  toggleMoodChip: (chip: string) => void;
  toggleGenreChip: (chip: string) => void;
  toggleLanguageChip: (chip: string) => void;
  toggleIntentChip: (chip: string) => void;
  setPromptText: (text: string) => void;
  setEnhancedPrompt: (prompt: string | null) => void;
  setBatchId: (id: string) => void;
  setSongs: (songs: Song[]) => void;
  selectSong: (id: string) => void;
  nextStep: () => void;
  prevStep: () => void;
  reset: () => void;
}

const toggleInArray = (arr: string[], item: string) =>
  arr.includes(item) ? arr.filter((i) => i !== item) : [...arr, item];

export const useCreateStore = create<CreateFlowState>((set) => ({
  step: 1,
  recipient: null,
  customRecipientName: "",
  emotion: null,
  moodChips: [],
  genreChips: [],
  languageChips: [],
  intentChips: [],
  promptText: "",
  enhancedPrompt: null,
  batchId: null,
  songs: [],
  selectedSongId: null,

  setRecipient: (r) => set({ recipient: r }),
  setCustomRecipientName: (name) => set({ customRecipientName: name }),
  setEmotion: (e) => set({ emotion: e }),
  toggleMoodChip: (chip) =>
    set((s) => ({ moodChips: toggleInArray(s.moodChips, chip) })),
  toggleGenreChip: (chip) =>
    set((s) => ({ genreChips: toggleInArray(s.genreChips, chip) })),
  toggleLanguageChip: (chip) =>
    set((s) => ({ languageChips: toggleInArray(s.languageChips, chip) })),
  toggleIntentChip: (chip) =>
    set((s) => ({ intentChips: toggleInArray(s.intentChips, chip) })),
  setPromptText: (text) => set({ promptText: text }),
  setEnhancedPrompt: (prompt) => set({ enhancedPrompt: prompt }),
  setBatchId: (id) => set({ batchId: id }),
  setSongs: (songs) => set({ songs }),
  selectSong: (id) => set({ selectedSongId: id }),
  nextStep: () =>
    set((s) => ({ step: Math.min(s.step + 1, 5) as CreateFlowState["step"] })),
  prevStep: () =>
    set((s) => ({ step: Math.max(s.step - 1, 1) as CreateFlowState["step"] })),
  reset: () =>
    set({
      step: 1,
      recipient: null,
      customRecipientName: "",
      emotion: null,
      moodChips: [],
      genreChips: [],
      languageChips: [],
      intentChips: [],
      promptText: "",
      enhancedPrompt: null,
      batchId: null,
      songs: [],
      selectedSongId: null,
    }),
}));
