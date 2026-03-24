import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { songId, fromName, toName, message, emotion, recipientType } =
      await request.json();

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: card, error } = await supabase
      .from("cards")
      .insert({
        song_id: songId,
        user_id: user.id,
        from_name: fromName,
        to_name: toName,
        message: message || null,
        emotion,
        recipient_type: recipientType,
        visual_theme: {},
        is_public: true,
      })
      .select()
      .single();

    if (error) throw error;

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    return NextResponse.json({
      card,
      shareUrl: `${appUrl}/card/${card.id}`,
    });
  } catch (error) {
    console.error("Card creation error:", error);
    return NextResponse.json(
      { error: "Failed to create card" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    const supabase = await createClient();

    const { data: card, error } = await supabase
      .from("cards")
      .select("*, song:songs(*)")
      .eq("id", id)
      .single();

    if (error || !card) {
      return NextResponse.json({ error: "Card not found" }, { status: 404 });
    }

    // Increment view count
    await supabase
      .from("cards")
      .update({ view_count: (card.view_count || 0) + 1 })
      .eq("id", id);

    return NextResponse.json({ card });
  } catch (error) {
    console.error("Card fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch card" },
      { status: 500 }
    );
  }
}
