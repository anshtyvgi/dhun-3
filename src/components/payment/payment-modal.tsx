"use client";

import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { PRICING } from "@/lib/constants";
import { useState } from "react";
import { toast } from "sonner";

interface PaymentModalProps {
  open: boolean;
  onClose: () => void;
  cardId: string;
  type: "download" | "share" | "extend";
  onSuccess?: () => void;
}

export function PaymentModal({
  open,
  onClose,
  cardId,
  type,
  onSuccess,
}: PaymentModalProps) {
  const [paying, setPaying] = useState(false);

  const labels = {
    download: "Download HD Card",
    share: "Share without watermark",
    extend: "Extend this song",
  };

  const handlePay = async () => {
    setPaying(true);
    try {
      const res = await fetch("/api/payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cardId, type }),
      });

      if (res.ok) {
        toast.success("Payment successful!");
        onSuccess?.();
        onClose();
      } else {
        toast.error("Payment failed");
      }
    } catch {
      toast.error("Payment failed");
    }
    setPaying(false);
  };

  return (
    <Modal open={open} onClose={onClose}>
      <div className="space-y-4">
        <h3 className="text-xl font-bold">{labels[type]}</h3>

        <div className="glass rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span>{labels[type]}</span>
            <span className="font-bold text-lg">Rs {PRICING[type]}</span>
          </div>
          <p className="text-dhun-text-muted text-xs">(Mock payment — always succeeds)</p>
        </div>

        <div className="flex gap-3">
          <Button variant="secondary" fullWidth onClick={onClose}>
            Cancel
          </Button>
          <Button fullWidth onClick={handlePay} loading={paying}>
            Pay Rs {PRICING[type]}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
