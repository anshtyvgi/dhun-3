import { createClient } from "@/lib/supabase/server";
import { PRICING } from "@/lib/constants";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { cardId, type } = await request.json();

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const amount = PRICING[type as keyof typeof PRICING];
    if (!amount) {
      return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    }

    // Mock payment — always succeeds
    const { data: transaction, error } = await supabase
      .from("transactions")
      .insert({
        user_id: user.id,
        card_id: cardId || null,
        type,
        amount,
        status: "completed",
      })
      .select()
      .single();

    if (error) throw error;

    // If it's a download/share, mark card as premium
    if (cardId && (type === "download" || type === "share")) {
      await supabase
        .from("cards")
        .update({ is_premium: true })
        .eq("id", cardId);
    }

    return NextResponse.json({
      success: true,
      transaction,
    });
  } catch (error) {
    console.error("Payment error:", error);
    return NextResponse.json(
      { error: "Payment failed" },
      { status: 500 }
    );
  }
}
