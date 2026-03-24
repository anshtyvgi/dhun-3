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

    // Generate 1 song via Suno (user can extend later)
    const sunoResult = await generateSong({
      prompt: finalPrompt,
      style: emotionConfig?.sunoStyle || "",
      title: "",
      customMode: false,
      instrumental: false,
    });

    const { data: song, error: songError } = await supabase
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

    if (songError) throw songError;
    const songs = [song];

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
