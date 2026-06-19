import { cn } from "@/shared/cn";

type Props = {
  value: number;
  className?: string;
};

export function Progress({ value, className }: Props) {
  const clamped = Math.max(0, Math.min(100, value));

  return (
    <div
      className={cn(
        "h-2 w-full overflow-hidden rounded-full border border-white/10 bg-white/5",
        className,
      )}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={clamped}
    >
      <div
        className="h-full rounded-full"
        style={{
          width: `${clamped}%`,
          background: "linear-gradient(to right, rgb(108, 92, 231), rgb(76, 201, 240))",
          boxShadow: "0 0 8px rgba(108,92,231,0.3)",
        }}
      />
    </div>
  );
}