import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface PageWrapperProps {
  children: ReactNode;
  className?: string;
  noPadding?: boolean;
}

export function PageWrapper({ children, className, noPadding }: PageWrapperProps) {
  return (
    <main
      className={cn(
        "min-h-screen pb-24",
        !noPadding && "px-4 pt-safe",
        className
      )}
    >
      {children}
    </main>
  );
}
