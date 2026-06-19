import { X, ArrowRight, CheckCircle, Clock } from "lucide-react";
import { useActivity } from "@/hooks/useActivity";

type Props = {
  onClose: () => void;
  onNavigate: (path: string) => void;
};

function groupByMonth(records: ReturnType<typeof useActivity>["data"]) {
  const groups: Record<string, NonNullable<typeof records>> = {};
  for (const r of records ?? []) {
    const key = new Date(r.updatedAt).toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
    if (!groups[key]) groups[key] = [];
    groups[key].push(r);
  }
  return groups;
}

export function ActivityModal({ onClose, onNavigate }: Props) {
  const { data: records = [], isLoading } = useActivity(100);
  const groups = groupByMonth(records);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div
        className="relative w-full max-w-2xl max-h-[80vh] flex flex-col rounded-2xl border"
        style={{
          background: "rgba(13, 15, 26, 0.95)",
          borderColor: "rgba(108, 92, 231, 0.25)",
          boxShadow: "0 0 40px rgba(108, 92, 231, 0.15)",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/[0.06] px-6 py-4">
          <h2 className="text-foreground">Activité du mois</h2>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-white/10 text-white/50 transition hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto px-6 py-4 space-y-6">
          {isLoading && (
            <p className="text-sm text-muted-foreground">Chargement...</p>
          )}

          {!isLoading && records.length === 0 && (
            <p className="text-sm text-muted-foreground">Aucune activité enregistrée.</p>
          )}

          {Object.entries(groups).map(([month, items]) => (
            <div key={month} className="space-y-2">
              <p className="text-xs font-medium uppercase tracking-widest text-white/40">{month}</p>

              {items.map((r) => (
                <div
                  key={`${r.chapterId}-${r.updatedAt}`}
                  className="group flex items-center justify-between gap-4 rounded-xl border p-4 transition hover:-translate-y-[1px]"
                  style={{
                    background: "rgba(255,255,255,0.02)",
                    borderColor: "rgba(255,255,255,0.06)",
                  }}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {r.status === "COMPLETED"
                      ? <CheckCircle className="h-4 w-4 shrink-0 text-emerald-400" />
                      : <Clock className="h-4 w-4 shrink-0 text-secondary" />
                    }
                    <div className="min-w-0">
                      <p className="truncate text-sm text-foreground">{r.chapterTitle}</p>
                      <p className="text-xs text-muted-foreground">{r.courseTitle}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`rounded-full border px-3 py-1 text-[11px] text-foreground ${
                      r.status === "COMPLETED"
                        ? "border-emerald-500/20 bg-emerald-500/10"
                        : "border-secondary/20 bg-secondary/10"
                    }`}>
                      {r.status === "COMPLETED" ? "Terminé" : "En cours"}
                    </span>
                    <button
                      type="button"
                      onClick={() => { onNavigate(`/app/courses/${r.courseId}/chapters/${r.chapterId}`); onClose(); }}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-white/10 bg-white/[0.02] text-foreground transition hover:bg-white/[0.05]"
                    >
                      <ArrowRight className="h-3.5 w-3.5 opacity-70 group-hover:opacity-100" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
