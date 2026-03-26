import * as React from "react";
import { cn } from "@/shared/cn";

type ButtonVariant = "primary" | "secondary" | "ghost";
type ButtonSize = "sm" | "md";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
};

export function Button({
  className,
  variant = "primary",
  size = "md",
  loading,
  disabled,
  children,
  ...props
}: Props) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-xl font-medium transition will-change-transform active:scale-[0.99] disabled:opacity-60 disabled:pointer-events-none outline-none focus-visible:ring-2 focus-visible:ring-violet-400/35";

  const variants: Record<ButtonVariant, string> = {
    primary:
      "bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 border border-primary/50 text-white shadow-[0_0_10px_rgba(108,92,231,0.35),0_0_22px_rgba(108,92,231,0.18)] backdrop-blur",
    secondary:
      "bg-white/10 hover:bg-white/15 border border-white/10 text-foreground backdrop-blur",
    ghost: "bg-transparent hover:bg-white/10 text-foreground",
  };

  const sizes: Record<ButtonSize, string> = {
    sm: "h-8 px-3 text-xs",
    md: "h-10 px-4 text-sm",
  };

  return (
    <button
      className={cn(base, variants[variant], sizes[size], className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? "..." : children}
    </button>
  );
}