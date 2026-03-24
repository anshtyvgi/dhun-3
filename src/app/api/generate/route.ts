import { createClient } from "@/lib/supabase/server";
import { generateSong } from "@/lib/suno/client";
import { enhancePrompt } from "@/lib/gemini/prompt-enhancer";
import { emotions } from "@/lib/emotions";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { promptText, enhancedPrompt, chips, emotion, recipientType } =
      await request.json();

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Use enhanced prompt or create one
    let finalPrompt = enhancedPrompt;
    if (!finalPrompt) {
      finalPrompt = await enhancePrompt({
        promptText: promptText || "",
        chips: chips || [],
        emotion,
        recipientType,
      });
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

    if (batchError) throw batchError;

    // Fire 3 Suno requests in PARALLEL for speed
    const songPromises = Array.from({ length: 3 }, async (_, i) => {
      try {
        const sunoResult = await generateSong({
          prompt: finalPrompt,
          style: emotionConfig?.sunoStyle || "",
          title: "",
          customMode: false,
          instrumental: false,
        });

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
        console.error(`Song ${i} generation failed:`, err);
        return null;
      }
    });

    // All 3 fire at once — don't wait sequentially
    const songs = (await Promise.all(songPromises)).filter(Boolean);

    return NextResponse.json({
      batchId: batch.id,
      songs,
    });
  } catch (error) {
    console.error("Generate error:", error);
    return NextResponse.json(
      { error: "Failed to generate songs" },
      { status: 500 }
    );
  }
}
