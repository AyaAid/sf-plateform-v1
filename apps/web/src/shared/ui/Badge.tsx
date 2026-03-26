import React from "react";
import { cn } from "@/shared/cn";

type Props = React.HTMLAttributes<HTMLSpanElement> & {
  tone?: "aqua" | "neutral";
};

export function Badge({ className, tone = "aqua", ...props }: Props) {
  const tones = {
    aqua: "bg-cyan-400/15 text-white border border-white/0",
    neutral: "bg-white/10 text-white border border-white/10",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium",
        tones[tone],
        className,
      )}
      {...props}
    />
  );
}