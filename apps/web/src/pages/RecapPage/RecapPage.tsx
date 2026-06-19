import React from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { ArrowRight, Loader2, Sparkles, Zap, CheckCircle } from "lucide-react";
import { Button } from "@/shared/ui/Button";
import { HudFrame } from "@/shared/ui/HudFrame";
import { apiClient } from "@/lib/apiClient";

type RecapState = {
  chapterTitle: string;
  score: number;
  answeredCount: number;
  totalInteractive: number;
  wasAlreadyCompleted: boolean;
};

export function RecapPage() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const state = location.state as RecapState | null;
  const chapterTitle = state?.chapterTitle ?? "Module";
  const score = state?.score ?? 0;
  const answeredCount = state?.answeredCount ?? 0;
  const totalInteractive = state?.totalInteractive ?? 0;
  const wasAlreadyCompleted = state?.wasAlreadyCompleted ?? false;

  const xpGained = wasAlreadyCompleted ? 0 : 100 + score;

  const [displayXP, setDisplayXP] = React.useState(0);
  const [aiFeedback, setAiFeedback] = React.useState<string | null>(null);
  const [loadingAI, setLoadingAI] = React.useState(true);

  // Animate XP counter
  React.useEffect(() => {
    if (xpGained === 0) { setDisplayXP(0); return; }
    const duration = 1400;
    const start = Date.now();
    const timer = setInterval(() => {
      const elapsed = Date.now() - start;
      const t = Math.min(1, elapsed / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplayXP(Math.round(eased * xpGained));
      if (t >= 1) clearInterval(timer);
    }, 16);
    return () => clearInterval(timer);
  }, [xpGained]);

  // Fetch AI feedback
  React.useEffect(() => {
    apiClient
      .post<{ feedback: string | null }>("/ai/feedback", {
        type: "module-recap",
        chapterTitle,
        score,
        answeredCount,
        totalInteractive,
      })
      .then(({ feedback }) => setAiFeedback(feedback))
      .catch(() => setAiFeedback(null))
      .finally(() => setLoadingAI(false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const hasInteractive = totalInteractive > 0;
  const pct = hasInteractive ? Math.round((answeredCount / totalInteractive) * 100) : 100;

  return (
    <div className="relative min-h-screen p-8">
      <div className="pointer-events-none absolute inset-0 opacity-40 space-grid" />

      <div className="relative mx-auto max-w-lg space-y-6 pt-8">

        {/* Titre */}
        <div className="text-center space-y-1">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs text-white/60 mb-3">
            <CheckCircle className="size-3.5 text-emerald-400" />
            Module terminé
          </div>
          <h1 className="text-2xl font-semibold text-white">{chapterTitle}</h1>
        </div>

        {/* XP */}
        <HudFrame className="p-8 text-center" hover={false}>
          <div
            className="mx-auto mb-3 flex size-20 items-center justify-center rounded-2xl"
            style={{
              background: "rgba(108,92,231,0.15)",
              border: "1px solid rgba(108,92,231,0.35)",
              boxShadow: "0 0 32px rgba(108,92,231,0.25), 0 0 64px rgba(108,92,231,0.1)",
            }}
          >
            <Zap className="size-9 text-violet-400" />
          </div>

          {wasAlreadyCompleted ? (
            <p className="text-sm text-white/40">Module déjà complété — XP déjà comptabilisés</p>
          ) : (
            <>
              <div
                className="text-5xl font-bold tabular-nums"
                style={{ color: "rgb(167,139,250)", textShadow: "0 0 20px rgba(139,92,246,0.5)" }}
              >
                +{displayXP}
              </div>
              <div className="mt-1 text-sm text-white/40">points XP gagnés</div>
            </>
          )}
        </HudFrame>

        {/* Stats */}
        {hasInteractive && (
          <div className="grid grid-cols-2 gap-3">
            <HudFrame className="p-5 text-center" hover={false}>
              <div className="text-3xl font-bold text-white">{answeredCount}</div>
              <div className="mt-1 text-xs text-white/40">exercices complétés</div>
              <div className="text-xs text-white/25">sur {totalInteractive}</div>
            </HudFrame>
            <HudFrame className="p-5 text-center" hover={false}>
              <div
                className="text-3xl font-bold"
                style={{ color: pct >= 80 ? "rgb(52,211,153)" : pct >= 50 ? "rgb(251,191,36)" : "rgb(248,113,113)" }}
              >
                {pct}%
              </div>
              <div className="mt-1 text-xs text-white/40">de complétion</div>
            </HudFrame>
          </div>
        )}

        {/* Feedback IA */}
        <HudFrame className="p-6" accent="blue" hover={false}>
          <div className="mb-3 flex items-center gap-2">
            {loadingAI ? (
              <Loader2 className="size-4 animate-spin text-secondary" />
            ) : (
              <Sparkles className="size-4 text-secondary" />
            )}
            <span className="text-xs font-semibold uppercase tracking-widest text-secondary/80">
              Feedback de ton tuteur IA
            </span>
          </div>

          {loadingAI ? (
            <p className="text-sm text-white/40">Analyse de ta session…</p>
          ) : aiFeedback ? (
            <p className="text-sm leading-6 text-white/80">{aiFeedback}</p>
          ) : (
            <p className="text-sm leading-6 text-white/50">
              {wasAlreadyCompleted
                ? "Tu as revu ce module. Continue sur ta lancée !"
                : pct === 100
                ? "Excellent travail, tu as complété tous les exercices de ce module !"
                : "Bonne avancée sur ce module. Reviens compléter les exercices restants quand tu es prêt."}
            </p>
          )}
        </HudFrame>

        {/* CTA */}
        <Button
          className="w-full rounded-xl py-4 text-base"
          onClick={() => navigate(`/app/courses/${courseId}`)}
        >
          Retour au cours
          <ArrowRight className="ml-2 size-5" />
        </Button>
      </div>
    </div>
  );
}
