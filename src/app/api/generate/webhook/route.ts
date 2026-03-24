import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log("[Webhook] Raw body:", JSON.stringify(body).slice(0, 800));

    // Callback format from docs:
    // { code, msg, data: { callbackType, task_id, data: [{ audio_url, title, prompt, duration, ... }] } }
    const callbackType = body.data?.callbackType;
    const taskId = body.data?.task_id;
    const songsData = body.data?.data || [];
    const code = body.code;

    if (!taskId) {
      console.log("[Webhook] No task_id found");
      return NextResponse.json({ status: "received" });
    }

    console.log(`[Webhook] taskId=${taskId} type=${callbackType} code=${code} songs=${songsData.length}`);

    const supabase = createAdminClient();

    if (code === 200 && (callbackType === "complete" || callbackType === "first") && songsData.length > 0) {
      // Callback uses snake_case: audio_url, stream_audio_url, etc.
      const song = songsData[0];
      console.log(`[Webhook] Updating: title="${song.title}" audio="${(song.audio_url || "").slice(0, 60)}"`);

      await supabase
        .from("songs")
        .update({
          status: "completed",
          audio_url: song.audio_url || song.stream_audio_url || null,
          lyrics: song.prompt || null,
          title: song.title || null,
          duration_seconds: song.duration ? Math.round(song.duration) : null,
          updated_at: new Date().toISOString(),
        })
        .eq("suno_task_id", taskId);

      console.log(`[Webhook] Song updated for task ${taskId}`);
    } else if (code !== 200 || callbackType === "error") {
      console.log(`[Webhook] Failed: code=${code} msg=${body.msg}`);
      await supabase
        .from("songs")
        .update({ status: "failed", updated_at: new Date().toISOString() })
        .eq("suno_task_id", taskId);
    }

    return NextResponse.json({ status: "received" });
  } catch (error) {
    console.error("[Webhook] Error:", error);
    return NextResponse.json({ status: "received" });
  }
}
