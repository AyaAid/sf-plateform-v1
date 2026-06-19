import { CheckCircle } from "lucide-react";

type Props = { label: string };

export function AlreadyAnsweredBadge({ label }: Props) {
  return (
    <div
      className="flex items-center gap-3 rounded-2xl border p-5"
      style={{
        background: "rgba(16,185,129,0.06)",
        borderColor: "rgba(16,185,129,0.25)",
      }}
    >
      <CheckCircle className="size-5 shrink-0 text-emerald-400" />
      <div>
        <span className="text-xs font-medium uppercase tracking-widest text-emerald-400">{label}</span>
        <p className="text-sm text-white/50">Déjà répondu ✓</p>
      </div>
    </div>
  );
}
