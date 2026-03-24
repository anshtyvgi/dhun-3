import { geminiModel } from "./client";
import { emotions } from "../emotions";
import { recipients } from "../recipients";
import type { EmotionType, RecipientType } from "../types";

interface EnhanceInput {
  promptText: string;
  chips: string[];
  emotion: EmotionType;
  recipientType: RecipientType;
}

export async function enhancePrompt({
  promptText,
  chips,
  emotion,
  recipientType,
}: EnhanceInput): Promise<string> {
  const emotionConfig = emotions[emotion];
  const recipientConfig = recipients[recipientType];

  const systemPrompt = `You are a lyrical prompt enhancer for an AI music generation app called Dhun.
Your job is to take a user's raw emotional input and transform it into a rich, poetic music prompt.

RULES:
- Keep the user's original intent and emotion at the core
- Expand with vivid imagery, sensory details, and emotional depth
- Include musical direction: tempo, mood, instrument suggestions
- Keep it under 200 words
- Write in the language the user used (Hindi, English, or Hinglish)
- Do NOT add any meta-text or explanation — output ONLY the enhanced prompt
- The tone should be: ${recipientConfig.toneModifier}
- The emotional core: ${emotionConfig.promptHint}
- Suggested music style: ${emotionConfig.sunoStyle}

USER CONTEXT:
- This song is for: ${recipientConfig.label}
- Emotion: ${emotionConfig.label}
- Selected tags: ${chips.join(", ")}

Enhance this into a beautiful music prompt:`;

  const result = await geminiModel.generateContent([
    systemPrompt,
    promptText || `A ${emotionConfig.label.toLowerCase()} song for my ${recipientConfig.label.toLowerCase()}`,
  ]);

  const response = result.response;
  return response.text().trim();
}
