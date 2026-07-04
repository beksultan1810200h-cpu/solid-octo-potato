import { cn } from "@/lib/utils";
import { forwardRef, type ButtonHTMLAttributes } from "react";

type Variant = "default" | "neon" | "ghost" | "danger";

const styles: Record<Variant, string> = {
  default:
    "glass text-foreground hover:bg-white/10",
  neon:
    "neon-border bg-[oklch(0.78_0.18_200_/_0.15)] text-[oklch(0.95_0.06_200)] hover:bg-[oklch(0.78_0.18_200_/_0.25)]",
  ghost:
    "bg-transparent text-muted-foreground hover:text-foreground hover:bg-white/5",
  danger:
    "bg-[oklch(0.55_0.22_25_/_0.2)] border border-[oklch(0.7_0.24_25_/_0.5)] text-[oklch(0.92_0.1_25)] hover:bg-[oklch(0.55_0.22_25_/_0.35)]",
};

export const GlassButton = forwardRef<
  HTMLButtonElement,
  ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }
>(function GlassButton({ className, variant = "default", ...props }, ref) {
  return (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none",
        styles[variant],
        className,
      )}
      {...props}
    />
  );
});