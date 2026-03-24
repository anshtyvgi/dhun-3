"use client";

import { Toaster } from "sonner";

export function ToastProvider() {
  return (
    <Toaster
      position="top-center"
      toastOptions={{
        style: {
          background: "#121218",
          border: "1px solid rgba(255,255,255,0.06)",
          color: "#f0f0f5",
          backdropFilter: "blur(20px)",
        },
      }}
    />
  );
}
