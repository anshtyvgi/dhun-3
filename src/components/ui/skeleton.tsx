import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        "bg-dhun-surface-light rounded-xl animate-pulse",
        className
      )}
    />
  );
}
