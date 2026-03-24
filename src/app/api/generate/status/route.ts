import { createClient } from "@/lib/supabase/server";
import { getSongStatus } from "@/lib/suno/client";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const batchId = searchParams.get("batchId");

    if (!batchId) {
      return NextResponse.json(
        { error: "batchId is required" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Fetch songs in this batch
    const { data: songs, error } = await supabase
      .from("songs")
      .select("*")
      .eq("batch_id", batchId)
      .order("created_at", { ascending: true });

    if (error) throw error;

    // For any pending/generating songs, check Suno status
    const updatedSongs = await Promise.all(
      (songs || []).map(async (song) => {
        if (
          (song.status === "pending" || song.status === "generating") &&
          song.suno_task_id
        ) {
          try {
            const status = await getSongStatus(song.suno_task_id);

            if (status.status === "complete" || status.status === "SUCCESS") {
              const sunoData = status.data?.[0];
              if (sunoData) {
                const { data: updated } = await supabase
                  .from("songs")
                  .update({
                    status: "completed",
                    audio_url: sunoData.audio_url || sunoData.stream_audio_url,
                    lyrics: sunoData.lyric || null,
                    title: sunoData.title || null,
                    duration_seconds: sunoData.duration
                      ? Math.round(sunoData.duration)
                      : null,
                    updated_at: new Date().toISOString(),
                  })
                  .eq("id", song.id)
                  .select()
                  .single();

                return updated || song;
              }
            }

            if (status.status === "failed" || status.status === "FAILED") {
              await supabase
                .from("songs")
                .update({ status: "failed", updated_at: new Date().toISOString() })
                .eq("id", song.id);
              return { ...song, status: "failed" };
            }
          } catch (err) {
            console.error(`Status check failed for ${song.id}:`, err);
          }
        }
        return song;
      })
    );

    const allCompleted = updatedSongs.every(
      (s) => s.status === "completed" || s.status === "failed"
    );

    return NextResponse.json({
      batchId,
      status: allCompleted ? "completed" : "generating",
      songs: updatedSongs,
    });
  } catch (error) {
    console.error("Status check error:", error);
    return NextResponse.json(
      { error: "Failed to check status" },
      { status: 500 }
    );
  }
}
