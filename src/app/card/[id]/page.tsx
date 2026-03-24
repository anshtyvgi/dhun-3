import { createClient } from "@/lib/supabase/server";
import { emotions } from "@/lib/emotions";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CardView } from "./card-view";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();

  const { data: card } = await supabase
    .from("cards")
    .select("*, song:songs(*)")
    .eq("id", id)
    .single();

  if (!card) return { title: "Dhun" };

  const emotionConfig = emotions[card.emotion as keyof typeof emotions];

  return {
    title: `${card.from_name} made a song for ${card.to_name} | Dhun`,
    description: card.song?.lyrics?.split("\n")[0] || "A song made with feelings on Dhun",
    openGraph: {
      title: `${emotionConfig?.emoji || "🎵"} A song from ${card.from_name} to ${card.to_name}`,
      description: card.message || "Listen to this song made with Dhun",
      type: "music.song",
    },
  };
}

export default async function CardPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: card } = await supabase
    .from("cards")
    .select("*, song:songs(*)")
    .eq("id", id)
    .single();

  if (!card || !card.song) return notFound();

  // Increment view count
  await supabase
    .from("cards")
    .update({ view_count: (card.view_count || 0) + 1 })
    .eq("id", id);

  return <CardView card={card} song={card.song} />;
}
