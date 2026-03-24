import { generateSong } from "@/lib/suno/client";
import { enhancePrompt } from "@/lib/gemini/prompt-enhancer";
import { emotions } from "@/lib/emotions";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { promptText, enhancedPrompt, chips, emotion, recipientType } =
      await request.json();

    console.log("[Generate] Starting:", { emotion, recipientType, promptText: promptText?.slice(0, 50) });

    // Enhance prompt — catch Gemini errors gracefully
    let finalPrompt = enhancedPrompt;
    if (!finalPrompt) {
      try {
        finalPrompt = await enhancePrompt({
          promptText: promptText || "",
          chips: chips || [],
          emotion,
          recipientType,
        });
        console.log("[Generate] Prompt enhanced OK");
      } catch (err) {
        console.error("[Generate] Gemini failed:", err);
        finalPrompt = promptText || `A ${emotion} song`;
      }
    }

    const emotionConfig = emotions[emotion as keyof typeof emotions];

    // Fire 3 Suno requests in PARALLEL
    const songPromises = Array.from({ length: 3 }, async (_, i) => {
      try {
        console.log(`[Generate] Suno request ${i + 1}/3`);
        const sunoResult = await generateSong({
          prompt: finalPrompt,
          style: emotionConfig?.sunoStyle || "",
          title: "",
          customMode: false,
          instrumental: false,
        });
        console.log(`[Generate] Suno ${i + 1} taskId: ${sunoResult.task_id}`);

        return {
          id: `song-${i}-${Date.now()}`,
          suno_task_id: sunoResult.task_id,
          status: "generating",
          emotion,
          recipient_type: recipientType,
          prompt_original: promptText || "",
          prompt_enhanced: finalPrompt,
          audio_url: null,
          lyrics: null,
          title: null,
          duration_seconds: null,
        };
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        console.error(`[Generate] Song ${i + 1} failed:`, msg);
        return {
          id: `error-${i}-${Date.now()}`,
          suno_task_id: null,
          status: "failed",
          error: msg,
          emotion,
          recipient_type: recipientType,
          audio_url: null, lyrics: null, title: null, duration_seconds: null,
          prompt_original: promptText || "", prompt_enhanced: finalPrompt,
        };
      }
    });

    const songs = await Promise.all(songPromises);
    console.log(`[Generate] ${songs.length} songs, taskIds: ${songs.map(s => s?.suno_task_id).join(", ")}`);

    return NextResponse.json({
      batchId: `batch-${Date.now()}`,
      songs,
    });
  } catch (error) {
    console.error("[Generate] Fatal:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate" },
      { status: 500 }
    );
  }
}
