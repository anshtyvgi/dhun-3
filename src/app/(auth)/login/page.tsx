"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const supabase = createClient();
  const router = useRouter();

  const handleGoogleLogin = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/callback` },
    });
    if (error) setError(error.message);
    setLoading(false);
  };

  const handlePhoneLogin = async () => {
    if (!phone || phone.length < 10) { setError("Enter a valid phone number"); return; }
    setLoading(true);
    setError("");
    const formattedPhone = phone.startsWith("+") ? phone : `+91${phone}`;
    const { error } = await supabase.auth.signInWithOtp({ phone: formattedPhone });
    if (error) { setError(error.message); setLoading(false); }
    else router.push(`/verify?phone=${encodeURIComponent(formattedPhone)}`);
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-[#08080c]">
      {/* Cinematic top glow */}
      <div className="absolute top-0 left-0 right-0 h-[60vh] pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[400px] bg-[radial-gradient(ellipse,rgba(168,85,247,0.2)_0%,rgba(120,50,200,0.08)_40%,transparent_70%)] blur-2xl" />
        <div className="absolute top-20 left-1/4 w-[200px] h-[200px] bg-[radial-gradient(circle,rgba(236,72,153,0.12)_0%,transparent_70%)]" />
      </div>

      <div className="relative z-10 flex-1 flex flex-col px-7">
        {/* Spacer top */}
        <div className="pt-20" />

        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-center mb-3"
        >
          <h1 className="text-[52px] font-extrabold tracking-tighter leading-none">
            <span className="bg-gradient-to-b from-white via-white to-white/40 bg-clip-text text-transparent">
              Dhun
            </span>
          </h1>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="text-center text-[15px] text-white/35 font-light mb-16"
        >
          Send what you feel, as a song
        </motion.p>

        {/* Floating visual */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="flex justify-center mb-16"
        >
          <div className="relative">
            <div className="w-28 h-28 rounded-full bg-gradient-to-br from-purple-500/20 via-pink-500/10 to-transparent border border-white/[0.06] flex items-center justify-center backdrop-blur-sm">
              <span className="text-5xl animate-float">🎵</span>
            </div>
            <div className="absolute -inset-4 rounded-full bg-purple-500/5 blur-2xl animate-breathe" />
          </div>
        </motion.div>

        {/* Push auth to bottom */}
        <div className="flex-1" />

        {/* Auth section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.7 }}
          className="space-y-4 pb-12"
        >
          {/* Google */}
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full h-[56px] rounded-2xl bg-white/[0.06] border border-white/[0.07] text-white text-[15px] font-medium flex items-center justify-center gap-3 transition-all duration-300 hover:bg-white/[0.10] hover:border-white/[0.12] active:scale-[0.98] disabled:opacity-40"
          >
            <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Continue with Google
          </button>

          {/* Divider */}
          <div className="flex items-center gap-4 py-1">
            <div className="flex-1 h-px bg-white/[0.06]" />
            <span className="text-white/20 text-[11px] uppercase tracking-[0.15em] font-medium">or</span>
            <div className="flex-1 h-px bg-white/[0.06]" />
          </div>

          {/* Phone */}
          <div className="flex gap-2.5">
            <div className="h-[56px] rounded-2xl bg-white/[0.06] border border-white/[0.07] px-4 flex items-center text-white/30 text-[15px] font-medium flex-shrink-0">
              +91
            </div>
            <input
              type="tel"
              placeholder="Phone number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="flex-1 h-[56px] rounded-2xl bg-white/[0.06] border border-white/[0.07] px-5 text-white text-[15px] placeholder:text-white/20 outline-none transition-all duration-300 focus:bg-white/[0.08] focus:border-purple-500/25"
            />
          </div>

          <button
            onClick={handlePhoneLogin}
            disabled={loading}
            className="w-full h-[56px] rounded-2xl bg-[#cbff00] text-[#08080c] text-[15px] font-bold transition-all duration-300 hover:bg-[#d4ff33] hover:shadow-[0_0_40px_rgba(203,255,0,0.15)] active:scale-[0.98] disabled:opacity-40"
          >
            {loading ? "Sending..." : "Send OTP"}
          </button>

          {error && (
            <p className="text-red-400/70 text-[13px] text-center">{error}</p>
          )}

          <p className="text-white/15 text-[11px] text-center pt-1">
            By continuing, you agree to our Terms & Privacy Policy
          </p>
        </motion.div>
      </div>
    </div>
  );
}
