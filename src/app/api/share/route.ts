import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { cardId, platform } = await request.json();

    const supabase = await createClient();

    // Increment share count
    const { data: card } = await supabase
      .from("cards")
      .select("share_count, from_name, to_name")
      .eq("id", cardId)
      .single();

    if (card) {
      await supabase
        .from("cards")
        .update({ share_count: (card.share_count || 0) + 1 })
        .eq("id", cardId);
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const shareUrl = `${appUrl}/card/${cardId}`;
    const shareText = `${card?.from_name || "Someone"} made a song for ${card?.to_name || "you"} on Dhun 🎵\n\n${shareUrl}`;

    let platformUrl = shareUrl;
    if (platform === "whatsapp") {
      platformUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
    } else if (platform === "twitter") {
      platformUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
    }

    return NextResponse.json({
      shareUrl,
      shareText,
      platformUrl,
    });
  } catch (error) {
    console.error("Share error:", error);
    return NextResponse.json(
      { error: "Failed to share" },
      { status: 500 }
    );
  }
}
