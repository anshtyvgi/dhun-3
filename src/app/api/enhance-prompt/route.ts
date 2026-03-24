import { enhancePrompt } from "@/lib/gemini/prompt-enhancer";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { promptText, chips, emotion, recipientType } = await request.json();

    if (!emotion || !recipientType) {
      return NextResponse.json(
        { error: "emotion and recipientType are required" },
        { status: 400 }
      );
    }

    const enhancedPrompt = await enhancePrompt({
      promptText: promptText || "",
      chips: chips || [],
      emotion,
      recipientType,
    });

    return NextResponse.json({ enhancedPrompt });
  } catch (error) {
    console.error("Enhance prompt error:", error);
    return NextResponse.json(
      { error: "Failed to enhance prompt" },
      { status: 500 }
    );
  }
}
