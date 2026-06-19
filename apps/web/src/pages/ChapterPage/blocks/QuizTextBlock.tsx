import React from "react";
import { PenLine, BookOpen, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/shared/ui/Button";
import type { QuizTextBlock as QuizTextBlockType } from "@stars-factory/shared";
import { AlreadyAnsweredBadge } from "./AlreadyAnsweredBadge";
import { apiClient } from "@/lib/apiClient";

type Props = {
  block: QuizTextBlockType;
  onAnswered: () => void;
  alreadyAnswered?: boolean;
};

export function QuizTextBlock({ block, onAnswered, alreadyAnswered }: Props) {
  const [answer, setAnswer] = React.useState("");
  const [submitted, setSubmitted] = React.useState(false);
  const [aiFeedback, setAiFeedback] = React.useState<string | null>(null);
  const [loadingAI, setLoadingAI] = React.useState(false);

  if (alreadyAnswered && !submitted) return <AlreadyAnsweredBadge label="Réponse libre" />;

  async function handleSubmit() {
    if (!answer.trim()) return;
    setSubmitted(true);
    onAnswered();
    setLoadingAI(true);
    try {
      const { feedback } = await apiClient.post<{ feedback: string | null }>("/ai/feedback", {
        type: "quiz-text",
        question: block.question,
        userAnswer: answer,
        expectedPoints: block.expected_points,
        sampleAnswer: block.sample_answer,
      });
      setAiFeedback(feedback);
    } catch {
      setAiFeedback(null);
    } finally {
      setLoadingAI(false);
    }
  }

  return (
    <div
      className="rounded-2xl border p-6"
      style={{
        background: "rgba(26,31,51,0.6)",
        backdropFilter: "blur(12px)",
        borderColor: submitted ? "rgba(251,191,36,0.35)" : "rgba(108,92,231,0.2)",
      }}
    >
      <div className="mb-1 flex items-center gap-2">
        <PenLine className="size-4 text-amber-400" />
        <span className="text-xs font-medium uppercase tracking-widest text-amber-400">Réponse libre</span>
      </div>
      <p className="mb-4 text-sm font-semibold text-white">{block.question}</p>

      <textarea
        disabled={submitted}
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        rows={5}
        placeholder="Écris ta réponse ici…"
        className="w-full resize-none rounded-xl px-4 py-3 text-sm text-white/80 outline-none transition placeholder:text-white/25 focus:ring-1 focus:ring-amber-500/50 disabled:opacity-60"
        style={{
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.08)",
        }}
      />

      {!submitted && (
        <Button
          className="mt-3 w-full rounded-xl"
          onClick={handleSubmit}
          disabled={!answer.trim()}
          style={{ background: "rgba(251,191,36,0.2)", borderColor: "rgba(251,191,36,0.3)", color: "rgb(251,191,36)" }}
        >
          Soumettre ma réponse
        </Button>
      )}

      {submitted && (
        <div
          className="mt-4 rounded-xl p-5"
          style={{ background: "rgba(251,191,36,0.06)", border: "1px solid rgba(251,191,36,0.2)" }}
        >
          {loadingAI ? (
            <div className="flex items-center gap-2 text-sm text-white/50">
              <Loader2 className="size-4 animate-spin text-amber-400" />
              Analyse de ta réponse…
            </div>
          ) : aiFeedback ? (
            <>
              <div className="mb-3 flex items-center gap-2">
                <Sparkles className="size-4 text-amber-400" />
                <span className="text-xs font-semibold uppercase tracking-widest text-amber-400">Feedback personnalisé</span>
              </div>
              <p className="text-sm leading-6 text-white/80">{aiFeedback}</p>
            </>
          ) : (
            <>
              <div className="mb-3 flex items-center gap-2">
                <BookOpen className="size-4 text-amber-400" />
                <span className="text-xs font-semibold uppercase tracking-widest text-amber-400">Exemple de réponse attendue</span>
              </div>
              <p className="text-sm leading-6 text-white/70">{block.sample_answer}</p>
              {block.expected_points.length > 0 && (
                <div className="mt-4">
                  <p className="mb-2 text-xs text-white/40">Points clés à mentionner :</p>
                  <ul className="space-y-1">
                    {block.expected_points.map((pt, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-white/50">
                        <span className="mt-0.5 size-1.5 shrink-0 rounded-full bg-amber-400/60" />
                        {pt}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
