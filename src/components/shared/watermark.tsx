import { cn } from "@/lib/utils";

interface WatermarkProps {
  className?: string;
}

export function Watermark({ className }: WatermarkProps) {
  return (
    <div
      className={cn(
        "absolute bottom-4 right-4 text-xs text-white/20 font-medium",
        className
      )}
    >
      Made with Dhun
    </div>
  );
}
