import React from "react";
import { FileSearch, Loader2, Sparkles, ChevronDown, PenLine } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Button } from "@/shared/ui/Button";
import type { CaseStudyBlock as CaseStudyBlockType } from "@stars-factory/shared";
import { AlreadyAnsweredBadge } from "./AlreadyAnsweredBadge";
import { apiClient } from "@/lib/apiClient";

type Props = {
  block: CaseStudyBlockType;
  onAnswered: () => void;
  alreadyAnswered?: boolean;
};

export function CaseStudyBlock({ block, onAnswered, alreadyAnswered }: Props) {
  const [answers, setAnswers] = React.useState<string[]>(() => block.questions.map(() => ""));
  const [submitted, setSubmitted] = React.useState(false);
  const [aiFeedback, setAiFeedback] = React.useState<string | null>(null);
  const [loadingAI, setLoadingAI] = React.useState(false);
  const [correctionOpen, setCorrectionOpen] = React.useState(false);

  if (alreadyAnswered && !submitted) return <AlreadyAnsweredBadge label="Étude de cas" />;

  const canSubmit = answers.some((a) => a.trim().length > 0);

  async function handleSubmit() {
    setSubmitted(true);
    onAnswered();
    setLoadingAI(true);
    try {
      const { feedback } = await apiClient.post<{ feedback: string | null }>("/ai/feedback", {
        type: "case-study",
        caseText: block.case,
        questions: block.questions,
        userAnswer: answers,
        correction: block.correction,
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
        borderColor: submitted ? "rgba(34,211,238,0.35)" : "rgba(34,211,238,0.2)",
      }}
    >
      <div className="mb-1 flex items-center gap-2">
        <FileSearch className="size-4 text-cyan-400" />
        <span className="text-xs font-medium uppercase tracking-widest text-cyan-400">Étude de cas</span>
      </div>
      {block.title && <h3 className="mb-4 text-base font-semibold text-white">{block.title}</h3>}

      {/* Scenario */}
      <div
        className="mb-5 rounded-xl p-4 text-sm leading-6 text-white/70"
        style={{ background: "rgba(34,211,238,0.05)", border: "1px solid rgba(34,211,238,0.12)" }}
      >
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{block.case}</ReactMarkdown>
      </div>

      {/* Questions + réponses */}
      <div className="mb-5 space-y-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-white/40">Tes réponses</p>
        {block.questions.map((q, i) => (
          <div key={i} className="space-y-2">
            <div
              className="flex gap-3 rounded-xl p-4 text-sm text-white/70"
              style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}
            >
              <span className="shrink-0 text-xs font-bold text-cyan-400/70">{i + 1}.</span>
              <span>{q}</span>
            </div>
            <div className="flex items-start gap-2 pl-1">
              <PenLine className="mt-3 size-3.5 shrink-0 text-white/20" />
              <textarea
                disabled={submitted}
                value={answers[i]}
                onChange={(e) => {
                  const next = [...answers];
                  next[i] = e.target.value;
                  setAnswers(next);
                }}
                rows={3}
                placeholder="Ta réponse…"
                className="w-full resize-none rounded-xl px-4 py-3 text-sm text-white/80 outline-none transition placeholder:text-white/20 focus:ring-1 focus:ring-cyan-500/40 disabled:opacity-50"
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.07)",
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {!submitted && (
        <Button
          className="w-full rounded-xl"
          onClick={handleSubmit}
          disabled={!canSubmit}
          style={{ background: "rgba(34,211,238,0.15)", borderColor: "rgba(34,211,238,0.3)", color: "rgb(34,211,238)" }}
        >
          Soumettre mes réponses
        </Button>
      )}

      {/* Feedback AI ou fallback */}
      {submitted && (
        <div
          className="mt-4 rounded-xl p-5"
          style={{ background: "rgba(34,211,238,0.05)", border: "1px solid rgba(34,211,238,0.2)" }}
        >
          {loadingAI ? (
            <div className="flex items-center gap-2 text-sm text-white/50">
              <Loader2 className="size-4 animate-spin text-cyan-400" />
              Analyse de tes réponses…
            </div>
          ) : aiFeedback ? (
            <>
              <div className="mb-3 flex items-center gap-2">
                <Sparkles className="size-4 text-cyan-400" />
                <span className="text-xs font-semibold uppercase tracking-widest text-cyan-400">Feedback personnalisé</span>
              </div>
              <p className="text-sm leading-6 text-white/80">{aiFeedback}</p>
            </>
          ) : null}
        </div>
      )}

      {/* Correction de référence (toujours accessible après soumission) */}
      {submitted && (
        <div className="mt-3">
          <button
            type="button"
            onClick={() => setCorrectionOpen((v) => !v)}
            className="flex w-full items-center justify-between rounded-xl px-4 py-3 text-sm transition"
            style={{
              background: correctionOpen ? "rgba(34,211,238,0.08)" : "rgba(255,255,255,0.02)",
              border: `1px solid ${correctionOpen ? "rgba(34,211,238,0.3)" : "rgba(255,255,255,0.08)"}`,
              color: correctionOpen ? "rgb(34,211,238)" : "rgba(255,255,255,0.4)",
            }}
          >
            <span className="font-medium">Voir la correction complète</span>
            <ChevronDown
              className="size-4 transition-transform"
              style={{ transform: correctionOpen ? "rotate(180deg)" : "none" }}
            />
          </button>

          {correctionOpen && (
            <div
              className="mt-3 rounded-xl p-5 text-sm leading-6"
              style={{ background: "rgba(34,211,238,0.05)", border: "1px solid rgba(34,211,238,0.15)" }}
            >
              <div className="prose prose-invert prose-sm max-w-none text-white/70 prose-strong:text-white prose-headings:text-white">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{block.correction}</ReactMarkdown>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
