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
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      console.log("[Generate] No auth user found");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("[Generate] User:", user.id);

    // Use enhanced prompt or create one — catch Gemini errors gracefully
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
        console.error("[Generate] Gemini enhancement failed, using raw prompt:", err);
        finalPrompt = promptText || `A ${emotion} song`;
      }
    }

    const emotionConfig = emotions[emotion as keyof typeof emotions];

    // Create generation batch
    const { data: batch, error: batchError } = await supabase
      .from("generation_batches")
      .insert({
        user_id: user.id,
        prompt_original: promptText || "",
        prompt_enhanced: finalPrompt,
        recipient_type: recipientType,
        emotion,
        status: "generating",
      })
      .select()
      .single();

    if (batchError) {
      console.error("[Generate] Batch creation failed:", batchError);
      throw batchError;
    }

    console.log("[Generate] Batch created:", batch.id);

    // Fire 3 Suno requests in PARALLEL — each returns 2 songs = 6 total
    // User picks their favorite from the results
    const songPromises = Array.from({ length: 3 }, async (_, i) => {
      try {
        console.log(`[Generate] Firing Suno request ${i + 1}/3`);
        const sunoResult = await generateSong({
          prompt: finalPrompt,
          style: emotionConfig?.sunoStyle || "",
          title: "",
          customMode: false,
          instrumental: false,
        });

        console.log(`[Generate] Suno ${i + 1} taskId: ${sunoResult.task_id}`);

        const { data: song } = await supabase
          .from("songs")
          .insert({
            user_id: user.id,
            batch_id: batch.id,
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
      } catch (err) {
        console.error(`[Generate] Song ${i + 1} failed:`, err);
        return null;
      }
    });

    const songs = (await Promise.all(songPromises)).filter(Boolean);
    console.log(`[Generate] ${songs.length} songs created in DB`);

    return NextResponse.json({ batchId: batch.id, songs });
  } catch (error) {
    console.error("[Generate] Fatal error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate songs" },
      { status: 500 }
    );
  }
}
