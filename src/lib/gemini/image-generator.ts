import { imagenModel } from "./client";
import { emotions } from "../emotions";
import type { EmotionType } from "../types";

interface GenerateImageInput {
  emotion: EmotionType;
  songTitle?: string;
  lyricsSnippet?: string;
}

export async function generateCardBackground({
  emotion,
  songTitle,
  lyricsSnippet,
}: GenerateImageInput): Promise<string | null> {
  const emotionConfig = emotions[emotion];
  const [c1, c2, c3] = emotionConfig.colors;

  const prompt = `Create an abstract, cinematic background image for a music card.
Style: dark, moody, atmospheric, emotional
Color palette: ${c1}, ${c2}, ${c3} on a near-black background
Mood: ${emotionConfig.label} - ${emotionConfig.promptHint}
${songTitle ? `Song title: "${songTitle}"` : ""}
${lyricsSnippet ? `Lyrics feel: "${lyricsSnippet}"` : ""}

Requirements:
- Abstract/atmospheric — no text, no people, no faces
- Gradients, light particles, bokeh effects
- Cinematic depth and lighting
- Suitable as a background with text overlay on top
- Dark enough for white text readability
- 9:16 portrait aspect ratio`;

  try {
    const result = await imagenModel.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    // For now, return null — we'll use CSS gradients as fallback
    // Imagen integration will be added when API supports direct image gen
    return null;
  } catch (error) {
    console.error("Image generation failed:", error);
    return null;
  }
}
