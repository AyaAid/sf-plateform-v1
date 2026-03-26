import * as React from "react";
import { cn } from "@/shared/cn";

type Props = React.HTMLAttributes<HTMLDivElement> & {
  accent?: "purple" | "blue" | "none";
  hover?: boolean;
};

export function HudFrame({
  className,
  accent = "purple",
  hover = true,
  children,
  ...props
}: Props) {
  const accentBorder =
    accent === "blue"
      ? "rgba(76, 201, 240, 0.25)"
      : accent === "purple"
        ? "rgba(108, 92, 231, 0.25)"
        : "rgba(255,255,255,0.08)";

  const glow =
    accent === "blue"
      ? "0 0 22px rgba(76,201,240,0.18)"
      : accent === "purple"
        ? "0 0 22px rgba(108,92,231,0.18)"
        : "none";

  return (
    <div
      className={cn(
        "relative rounded-2xl border p-6",
        hover && "transition-all hover:-translate-y-[1px]",
        className
      )}
      style={{
        background: "rgba(26, 31, 51, 0.6)",
        backdropFilter: "blur(12px)",
        borderColor: accentBorder,
        boxShadow: `0 4px 16px rgba(0,0,0,0.5), ${glow}`,
      }}
      {...props}
    >
      <div className="pointer-events-none absolute left-0 top-0 h-px w-full bg-gradient-to-r from-transparent via-primary/40 to-transparent opacity-40" />

      {children}
    </div>
  );
}