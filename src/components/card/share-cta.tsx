"use client";

import { motion } from "framer-motion";
import { toast } from "sonner";

interface ShareCtaProps {
  cardId: string;
  onPaymentRequired?: (type: "download" | "share") => void;
  isPremium?: boolean;
}

export function ShareCta({ cardId, onPaymentRequired, isPremium }: ShareCtaProps) {
  const shareUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/card/${cardId}`;

  const handleShare = async (platform: string) => {
    try {
      await fetch("/api/share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cardId, platform }),
      });

      if (platform === "whatsapp") {
        window.open(
          `https://wa.me/?text=${encodeURIComponent(`Check out this song I made on Dhun 🎵\n\n${shareUrl}`)}`,
          "_blank"
        );
      } else if (platform === "copy") {
        await navigator.clipboard.writeText(shareUrl);
        toast.success("Link copied!");
      } else if (platform === "native" && navigator.share) {
        await navigator.share({
          title: "A song from Dhun",
          text: "Check out this song I made on Dhun 🎵",
          url: shareUrl,
        });
      }
    } catch {
      // ignore
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex gap-2.5"
    >
      <button
        onClick={() => handleShare("whatsapp")}
        className="flex-1 h-11 rounded-xl bg-green-500/[0.12] border border-green-500/[0.15] text-green-400 text-[13px] font-medium flex items-center justify-center gap-2 transition-all hover:bg-green-500/[0.18] active:scale-[0.97]"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
        WhatsApp
      </button>

      <button
        onClick={() => handleShare("copy")}
        className="flex-1 h-11 rounded-xl bg-white/[0.05] border border-white/[0.06] text-white/60 text-[13px] font-medium flex items-center justify-center gap-2 transition-all hover:bg-white/[0.08] active:scale-[0.97]"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>
        Copy
      </button>

      <button
        onClick={() => handleShare("native")}
        className="h-11 w-11 rounded-xl bg-white/[0.05] border border-white/[0.06] text-white/40 flex items-center justify-center transition-all hover:bg-white/[0.08] active:scale-[0.97] flex-shrink-0"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
      </button>
    </motion.div>
  );
}
