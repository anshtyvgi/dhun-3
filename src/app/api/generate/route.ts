import { createClient } from "@/lib/supabase/server";
import { generateSong } from "@/lib/suno/client";
import { enhancePrompt } from "@/lib/gemini/prompt-enhancer";
import { emotions } from "@/lib/emotions";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { promptText, enhancedPrompt, chips, emotion, recipientType } =
      await request.json();

    console.log("[Generate] Starting:", { emotion, recipientType, promptText: promptText?.slice(0, 50) });

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id;
    console.log("[Generate] User:", userId || "ANONYMOUS (no auth)");

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
        console.log("[Generate] Prompt enhanced:", finalPrompt?.slice(0, 80));
      } catch (err) {
        console.error("[Generate] Gemini failed, using raw prompt:", err);
        finalPrompt = promptText || `A ${emotion} song`;
      }
    }

    const emotionConfig = emotions[emotion as keyof typeof emotions];

    // Create batch in DB if user is logged in
    let batchId: string | null = null;
    if (userId) {
      const { data: batch } = await supabase
        .from("generation_batches")
        .insert({
          user_id: userId,
          prompt_original: promptText || "",
          prompt_enhanced: finalPrompt,
          recipient_type: recipientType,
          emotion,
          status: "generating",
        })
        .select()
        .single();
      batchId = batch?.id || null;
      console.log("[Generate] Batch:", batchId);
    }

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

        // Save to DB if user is logged in
        if (userId && batchId) {
          const { data: song } = await supabase
            .from("songs")
            .insert({
              user_id: userId,
              batch_id: batchId,
              prompt_original: promptText || "",
              prompt_enhanced: finalPrompt,
              recipient_type: recipientType,
              emotion,
              status: "generating",
              suno_task_id: sunoResult.task_id,
            })
            .select()
            .single();
          return song;
        }

        // Anonymous mode — return fake song object
        return {
          id: `anon-${i}-${Date.now()}`,
          batch_id: batchId,
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
        console.error(`[Generate] Song ${i + 1} failed:`, err);
        return null;
      }
    });

    const songs = (await Promise.all(songPromises)).filter(Boolean);
    console.log(`[Generate] ${songs.length} songs created`);

    return NextResponse.json({
      batchId: batchId || `anon-batch-${Date.now()}`,
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
