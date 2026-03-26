import React from "react";
import { cn } from "@/shared/cn";

export type SelectOption = { value: string; label: string };

type Props = {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  className?: string;
};

export function Select({ value, onChange, options, placeholder, className }: Props) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement | null>(null);

  const current = options.find((o) => o.value === value);

  React.useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    <div ref={ref} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "h-11 w-full rounded-2xl border border-white/10 px-4 text-sm text-white",
          "bg-white/[0.05] backdrop-blur-xl outline-none",
          "flex items-center justify-between gap-3",
          "shadow-[0_4px_16px_rgba(0,0,0,0.5),0_0_25px_rgba(108,92,231,0.15)]",
          "hover:bg-white/[0.07] focus:ring-2 focus:ring-violet-500/20",
        )}
      >
        <span className={cn(!current && "text-white/50")}>
          {current?.label ?? placeholder ?? "Select"}
        </span>
        <span className="text-white/50">▾</span>
      </button>

      {open && (
        <div
          className={cn(
            "absolute z-50 mt-2 w-full overflow-hidden rounded-2xl border border-white/10",
            "bg-neutral-950/80 backdrop-blur-xl",
            "shadow-[0_10px_30px_rgba(0,0,0,0.65),0_0_25px_rgba(108,92,231,0.15)]",
          )}
        >
          <div className="p-1">
            {options.map((opt) => {
              const active = opt.value === value;
              return (
                <button
                  type="button"
                  key={opt.value}
                  onClick={() => {
                    onChange(opt.value);
                    setOpen(false);
                  }}
                  className={cn(
                    "w-full rounded-xl px-3 py-2 text-left text-sm",
                    "hover:bg-white/10",
                    active ? "bg-white/10 text-white" : "text-white/80",
                  )}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}