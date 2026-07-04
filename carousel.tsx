import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

export function GlassCard({
  className,
  neon,
  ...props
}: HTMLAttributes<HTMLDivElement> & { neon?: boolean }) {
  return (
    <div
      className={cn(
        "glass rounded-2xl p-6",
        neon && "neon-border animate-pulse-glow",
        className,
      )}
      {...props}
    />
  );
}