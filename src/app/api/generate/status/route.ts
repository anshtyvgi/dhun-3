import { createClient } from "@/lib/supabase/server";
import { getSongStatus } from "@/lib/suno/client";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const batchId = searchParams.get("batchId");

    if (!batchId) {
      return NextResponse.json({ error: "batchId is required" }, { status: 400 });
    }

    const supabase = await createClient();

    const { data: songs, error } = await supabase
      .from("songs")
      .select("*")
      .eq("batch_id", batchId)
      .order("created_at", { ascending: true });

    if (error) throw error;

    // Check ALL pending songs in parallel
    const updatedSongs = await Promise.all(
      (songs || []).map(async (song) => {
        if (
          (song.status === "pending" || song.status === "generating") &&
          song.suno_task_id
        ) {
          try {
            const status = await getSongStatus(song.suno_task_id);
            console.log(`[Suno Status] task=${song.suno_task_id} status=${status.status} data_count=${status.data?.length || 0}`);

            // Suno API status values: PENDING, TEXT_SUCCESS, FIRST_SUCCESS, SUCCESS,
            // CREATE_TASK_FAILED, GENERATE_AUDIO_FAILED, CALLBACK_EXCEPTION, SENSITIVE_WORD_ERROR
            const s = (status.status || "").toUpperCase();
            const isComplete = s === "SUCCESS" || s === "FIRST_SUCCESS";
            const isFailed = s === "CREATE_TASK_FAILED" || s === "GENERATE_AUDIO_FAILED" ||
              s === "CALLBACK_EXCEPTION" || s === "SENSITIVE_WORD_ERROR";

            if (isComplete && status.data && status.data.length > 0) {
              const sunoData = status.data[0];
              console.log(`[Suno Complete] title="${sunoData.title}" audio="${sunoData.audioUrl?.slice(0, 80)}..." duration=${sunoData.duration}`);

              // Extract lyrics from the prompt field (Suno puts lyrics there)
              const lyrics = sunoData.prompt || null;

              const { data: updated } = await supabase
                .from("songs")
                .update({
                  status: "completed",
                  audio_url: sunoData.audioUrl || sunoData.streamAudioUrl || null,
                  lyrics,
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
              console.log(`[Suno Failed] task=${song.suno_task_id} error=${status.error}`);
              await supabase
                .from("songs")
                .update({ status: "failed", updated_at: new Date().toISOString() })
                .eq("id", song.id);
              return { ...song, status: "failed" };
            }
          } catch (err) {
            console.error(`[Suno Error] task=${song.suno_task_id}:`, err);
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
    console.error("Status check error:", error);
    return NextResponse.json({ error: "Failed to check status" }, { status: 500 });
  }
}
