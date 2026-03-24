"use client";

import { CardRenderer } from "@/components/card/card-renderer";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { PRICING } from "@/lib/constants";
import type { Card, Song } from "@/lib/types";
import { useState } from "react";
import { toast } from "sonner";

interface CardViewProps {
  card: Card;
  song: Song;
}

export function CardView({ card, song }: CardViewProps) {
  const [paymentModal, setPaymentModal] = useState(false);
  const [paymentType, setPaymentType] = useState<"download" | "share">("download");
  const [paying, setPaying] = useState(false);

  const handlePaymentRequired = (type: "download" | "share") => {
    setPaymentType(type);
    setPaymentModal(true);
  };

  const handlePay = async () => {
    setPaying(true);
    try {
      await fetch("/api/payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cardId: card.id, type: paymentType }),
      });
      toast.success("Payment successful!");
      setPaymentModal(false);
    } catch {
      toast.error("Payment failed");
    }
    setPaying(false);
  };

  return (
    <div className="max-w-[430px] mx-auto">
      <CardRenderer
        card={card}
        song={song}
        onPaymentRequired={handlePaymentRequired}
      />

      {/* Create your own CTA */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] p-4 glass-strong">
        <Button
          fullWidth
          size="lg"
          onClick={() => (window.location.href = "/login")}
        >
          Create your own song
        </Button>
      </div>

      {/* Payment Modal */}
      <Modal open={paymentModal} onClose={() => setPaymentModal(false)}>
        <div className="space-y-4">
          <h3 className="text-xl font-bold">
            {paymentType === "download" ? "Download HD Card" : "Share without watermark"}
          </h3>
          <p className="text-dhun-text-muted">
            {paymentType === "download"
              ? "Get the full quality card to save"
              : "Share a clean card without the watermark"}
          </p>
          <div className="glass rounded-xl p-4 flex items-center justify-between">
            <span className="text-lg font-semibold">
              Rs {PRICING[paymentType]}
            </span>
            <span className="text-dhun-text-muted text-sm">(mock payment)</span>
          </div>
          <Button fullWidth size="lg" onClick={handlePay} loading={paying}>
            Pay Rs {PRICING[paymentType]}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
