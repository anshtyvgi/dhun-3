"use client";

import { Suspense, useState, useRef, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { motion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";

function VerifyForm() {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const inputs = useRef<(HTMLInputElement | null)[]>([]);
  const router = useRouter();
  const searchParams = useSearchParams();
  const phone = searchParams.get("phone") || "";
  const supabase = createClient();

  useEffect(() => {
    inputs.current[0]?.focus();
  }, []);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    if (value && index < 5) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const token = otp.join("");
    if (token.length !== 6) {
      setError("Enter the full 6-digit code");
      return;
    }

    setLoading(true);
    setError("");

    const { error } = await supabase.auth.verifyOtp({
      phone,
      token,
      type: "sms",
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push("/home");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="space-y-8"
    >
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Verify OTP</h1>
        <p className="text-dhun-text-muted">
          Enter the code sent to {phone}
        </p>
      </div>

      <div className="flex gap-3 justify-center">
        {otp.map((digit, i) => (
          <input
            key={i}
            ref={(el) => { inputs.current[i] = el; }}
            type="tel"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            className="w-12 h-14 bg-dhun-surface border border-dhun-border rounded-xl text-center text-xl font-bold text-dhun-text outline-none transition-all duration-200 focus:border-dhun-accent-purple/50 focus:shadow-[0_0_20px_rgba(168,85,247,0.15)]"
          />
        ))}
      </div>

      <Button fullWidth size="lg" onClick={handleVerify} loading={loading}>
        Verify & Continue
      </Button>

      {error && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-red-400 text-sm text-center"
        >
          {error}
        </motion.p>
      )}

      <button
        onClick={() => router.back()}
        className="text-dhun-text-muted text-sm text-center w-full hover:text-dhun-text transition-colors"
      >
        Change phone number
      </button>
    </motion.div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-20">
          <Spinner size="lg" />
        </div>
      }
    >
      <VerifyForm />
    </Suspense>
  );
}
