import { createClient } from "@/lib/supabase/server";
import { getSongStatus } from "@/lib/suno/client";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const batchId = searchParams.get("batchId");
    // Anonymous mode: comma-separated task IDs passed directly
    const taskIds = searchParams.get("taskIds");

    // Anonymous polling — check Suno directly by task IDs
    if (taskIds) {
      const ids = taskIds.split(",").filter(Boolean);
      const results = await Promise.all(
        ids.map(async (taskId) => {
          try {
            const status = await getSongStatus(taskId);
            const s = (status.status || "").toUpperCase();
            const isComplete = s === "SUCCESS" || s === "FIRST_SUCCESS";
            const isFailed = s.includes("FAILED") || s.includes("ERROR");
            const sunoData = status.data?.[0];

            return {
              id: taskId,
              suno_task_id: taskId,
              status: isComplete ? "completed" : isFailed ? "failed" : "generating",
              audio_url: isComplete ? (sunoData?.audioUrl || sunoData?.streamAudioUrl || null) : null,
              lyrics: isComplete ? (sunoData?.prompt || null) : null,
              title: isComplete ? (sunoData?.title || null) : null,
              duration_seconds: isComplete && sunoData?.duration ? Math.round(sunoData.duration) : null,
            };
          } catch (err) {
            console.error(`[Status] Error checking ${taskId}:`, err);
            return { id: taskId, suno_task_id: taskId, status: "generating", audio_url: null, lyrics: null, title: null, duration_seconds: null };
          }
        })
      );

      const completedCount = results.filter((s) => s.status === "completed").length;
      const failedCount = results.filter((s) => s.status === "failed").length;

      return NextResponse.json({
        batchId: "anon",
        status: completedCount + failedCount === results.length ? "completed" : "generating",
        songs: results,
        debug: { total: results.length, completed: completedCount, failed: failedCount },
      });
    }

    // Normal mode — use DB
    if (!batchId) {
      return NextResponse.json({ error: "batchId or taskIds required" }, { status: 400 });
    }

    const supabase = await createClient();

    const { data: songs, error } = await supabase
      .from("songs")
      .select("*")
      .eq("batch_id", batchId)
      .order("created_at", { ascending: true });

    if (error) throw error;

    const updatedSongs = await Promise.all(
      (songs || []).map(async (song) => {
        if (
          (song.status === "pending" || song.status === "generating") &&
          song.suno_task_id
        ) {
          try {
            const status = await getSongStatus(song.suno_task_id);
            console.log(`[Status] task=${song.suno_task_id} status=${status.status} data=${status.data?.length || 0}`);

            const s = (status.status || "").toUpperCase();
            const isComplete = s === "SUCCESS" || s === "FIRST_SUCCESS";
            const isFailed = s === "CREATE_TASK_FAILED" || s === "GENERATE_AUDIO_FAILED" ||
              s === "CALLBACK_EXCEPTION" || s === "SENSITIVE_WORD_ERROR";

            if (isComplete && status.data && status.data.length > 0) {
              const sunoData = status.data[0];

              const { data: updated } = await supabase
                .from("songs")
                .update({
                  status: "completed",
                  audio_url: sunoData.audioUrl || sunoData.streamAudioUrl || null,
                  lyrics: sunoData.prompt || null,
                  title: sunoData.title || null,
                  duration_seconds: sunoData.duration ? Math.round(sunoData.duration) : null,
                  updated_at: new Date().toISOString(),
                })
                .eq("id", song.id)
                .select()
                .single();

              return updated || song;
            }

            if (isFailed) {
              await supabase
                .from("songs")
                .update({ status: "failed", updated_at: new Date().toISOString() })
                .eq("id", song.id);
              return { ...song, status: "failed" };
            }
          } catch (err) {
            console.error(`[Status] Error for ${song.suno_task_id}:`, err);
          }
        }
        return song;
      })
    );

    const completedCount = updatedSongs.filter((s) => s.status === "completed").length;
    const failedCount = updatedSongs.filter((s) => s.status === "failed").length;
    const allDone = completedCount + failedCount === updatedSongs.length;

    return NextResponse.json({
      batchId,
      status: allDone ? "completed" : "generating",
      songs: updatedSongs,
      debug: { total: updatedSongs.length, completed: completedCount, failed: failedCount },
    });
  } catch (error) {
    console.error("[Status] Fatal:", error);
    return NextResponse.json({ error: "Failed to check status" }, { status: 500 });
  }
}
