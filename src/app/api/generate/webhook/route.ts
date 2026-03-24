import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { task_id, status, data } = body;

    if (!task_id) {
      return NextResponse.json({ error: "Missing task_id" }, { status: 400 });
    }

    const supabase = createAdminClient();

    if (status === "complete" || status === "SUCCESS") {
      const sunoData = data?.[0] || data;

      await supabase
        .from("songs")
        .update({
          status: "completed",
          audio_url: sunoData?.audio_url || sunoData?.stream_audio_url,
          lyrics: sunoData?.lyric || null,
          title: sunoData?.title || null,
          duration_seconds: sunoData?.duration
            ? Math.round(sunoData.duration)
            : null,
          updated_at: new Date().toISOString(),
        })
        .eq("suno_task_id", task_id);
    } else if (status === "failed" || status === "FAILED") {
      await supabase
        .from("songs")
        .update({
          status: "failed",
          updated_at: new Date().toISOString(),
        })
        .eq("suno_task_id", task_id);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}
