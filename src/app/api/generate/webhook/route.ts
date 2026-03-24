import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log("[Webhook] Received:", JSON.stringify(body).slice(0, 500));

    // Suno callback format: { data: { taskId, status, response: { sunoData: [...] } } }
    const taskId = body.data?.taskId || body.task_id || body.taskId;
    const status = body.data?.status || body.status;
    const sunoDataArr = body.data?.response?.sunoData || body.data?.sunoData || [];

    if (!taskId) {
      return NextResponse.json({ error: "Missing taskId" }, { status: 400 });
    }

    const supabase = createAdminClient();

    if (status === "SUCCESS" || status === "FIRST_SUCCESS") {
      const sunoData = sunoDataArr[0];
      if (sunoData) {
        await supabase
          .from("songs")
          .update({
            status: "completed",
            audio_url: sunoData.audioUrl || sunoData.streamAudioUrl || null,
            lyrics: sunoData.prompt || null,
            title: sunoData.title || null,
            duration_seconds: sunoData.duration ? Math.round(sunoData.duration) : null,
            updated_at: new Date().toISOString(),
          })
          .eq("suno_task_id", taskId);

        console.log(`[Webhook] Updated song for task ${taskId} — ${sunoData.title}`);
      }
    } else if (["CREATE_TASK_FAILED", "GENERATE_AUDIO_FAILED", "SENSITIVE_WORD_ERROR"].includes(status)) {
      await supabase
        .from("songs")
        .update({ status: "failed", updated_at: new Date().toISOString() })
        .eq("suno_task_id", taskId);
      console.log(`[Webhook] Song failed for task ${taskId}: ${status}`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Webhook] Error:", error);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
