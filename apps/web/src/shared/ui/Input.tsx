import React from "react";
import { cn } from "@/shared/cn";

type Props = React.InputHTMLAttributes<HTMLInputElement>;

export function Input({ className, ...props }: Props) {
  return (
    <input
      className={cn(
        "h-11 w-full rounded-2xl border border-white/10 bg-white/[0.06] px-4 text-sm text-white placeholder:text-white/40 outline-none",
        "focus:border-white/20 focus:bg-white/[0.08] focus:ring-2 focus:ring-violet-500/20",
        className,
      )}
      {...props}
    />
  );
}