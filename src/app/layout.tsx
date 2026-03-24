import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { AuthProvider } from "@/providers/auth-provider";
import { ThemeProvider } from "@/providers/theme-provider";
import { ToastProvider } from "@/providers/toast-provider";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Dhun — Send what you feel, as a song",
  description: "Turn feelings into shareable music experiences",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#08080c",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="antialiased">
        <AuthProvider>
          <ThemeProvider>
            <div className="relative min-h-screen flex justify-center">
              {/* Desktop ambient */}
              <div className="hidden md:block fixed inset-0 pointer-events-none">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] rounded-full bg-purple-600/[0.04] blur-[200px]" />
              </div>
              {/* App frame */}
              <div className="w-full max-w-[430px] min-h-screen relative bg-[#08080c] md:my-6 md:rounded-[2.5rem] md:border md:border-white/[0.04] md:shadow-[0_0_80px_rgba(100,50,200,0.06)]">
                {children}
              </div>
            </div>
            <ToastProvider />
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
