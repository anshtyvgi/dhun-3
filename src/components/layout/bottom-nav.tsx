"use client";

import { cn } from "@/lib/utils";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";

const navItems = [
  {
    label: "Home",
    path: "/home",
    icon: (a: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill={a ? "currentColor" : "none"} stroke={a ? "none" : "currentColor"} strokeWidth="1.5">
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
        {!a && <polyline points="9 22 9 12 15 12 15 22" />}
      </svg>
    ),
  },
  {
    label: "Library",
    path: "/library",
    icon: (a: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill={a ? "currentColor" : "none"} stroke={a ? "none" : "currentColor"} strokeWidth="1.5">
        <path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" />
      </svg>
    ),
  },
  { label: "Create", path: "/create/recipient", isCenter: true },
  {
    label: "Explore",
    path: "/explore",
    icon: (a: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill={a ? "currentColor" : "none"} stroke={a ? "none" : "currentColor"} strokeWidth="1.5">
        <circle cx="12" cy="12" r="10" /><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
      </svg>
    ),
  },
  {
    label: "Profile",
    path: "/profile",
    icon: (a: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill={a ? "currentColor" : "none"} stroke={a ? "none" : "currentColor"} strokeWidth="1.5">
        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
];

export function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();

  // Hide on deep create flow pages
  if (pathname.startsWith("/create/") && !pathname.endsWith("/recipient")) return null;

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-50">
      <div className="mx-3 mb-3 rounded-[22px] bg-[#111116]/90 backdrop-blur-2xl border border-white/[0.05] px-1 py-1.5">
        <div className="flex items-center justify-around">
          {navItems.map((item) => {
            const isActive =
              pathname === item.path ||
              (item.path === "/home" && pathname === "/") ||
              (!item.isCenter && pathname.startsWith(`/${item.path.split("/")[1]}`));

            if (item.isCenter) {
              return (
                <motion.button
                  key="create"
                  whileTap={{ scale: 0.85 }}
                  onClick={() => router.push(item.path)}
                  className="relative -mt-7"
                >
                  <div className="absolute inset-0 rounded-full bg-[#cbff00] blur-xl opacity-30 scale-125" />
                  <div className="relative w-[52px] h-[52px] rounded-full bg-[#cbff00] flex items-center justify-center shadow-[0_4px_20px_rgba(203,255,0,0.25)]">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#08080c" strokeWidth="2.5" strokeLinecap="round">
                      <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                  </div>
                </motion.button>
              );
            }

            return (
              <motion.button
                key={item.label}
                whileTap={{ scale: 0.85 }}
                onClick={() => router.push(item.path)}
                className="flex flex-col items-center gap-1 py-1.5 px-3 min-w-[52px]"
              >
                <div className={cn(
                  "transition-colors duration-200",
                  isActive ? "text-[#cbff00]" : "text-white/25"
                )}>
                  {item.icon?.(isActive)}
                </div>
                <span className={cn(
                  "text-[10px] font-medium transition-colors duration-200",
                  isActive ? "text-[#cbff00]" : "text-white/25"
                )}>
                  {item.label}
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
