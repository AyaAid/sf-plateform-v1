import * as React from "react";
import { cn } from "@/shared/cn";

export function Pill({
  children,
  className,
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs text-foreground backdrop-blur-md",
        className
      )}
    >
      {children}
    </div>
  );
}

export function HudCornerLines() {
  return (
    <div className="pointer-events-none absolute inset-0">
      <div className="absolute left-8 top-8 flex items-center gap-2 text-xs text-secondary/90">
        <span className="h-2 w-2 rounded-full bg-secondary" />
        LIVE FEED
      </div>

      <div className="absolute right-8 top-8 flex items-center gap-3 text-secondary/90">
        <span className="h-2 w-2 rounded-full bg-secondary/60" />
        <span className="h-2 w-2 rounded-full bg-primary/60" />
        <span className="h-2 w-2 rounded-full bg-secondary/60" />
      </div>

      <div className="absolute left-8 top-16 h-px w-56 bg-gradient-to-r from-secondary/60 to-transparent opacity-60" />
      <div className="absolute right-8 top-16 h-16 w-px bg-gradient-to-b from-secondary/60 to-transparent opacity-60" />
    </div>
  );
}

export function StatTile({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div
      className="rounded-2xl border border-white/10 bg-white/[0.04] px-8 py-6 text-center backdrop-blur-xl"
      style={{
        boxShadow: "inset 0 1px 1px rgba(255,255,255,0.04)",
      }}
    >
      <div className="text-xs tracking-widest text-secondary/80">{label.toUpperCase()}</div>
      <div className="mt-2 text-3xl text-foreground">{value}</div>
    </div>
  );
}