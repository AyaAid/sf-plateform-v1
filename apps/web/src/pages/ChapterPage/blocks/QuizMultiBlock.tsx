import React from "react";
import { CheckCircle, XCircle, HelpCircle } from "lucide-react";
import { Button } from "@/shared/ui/Button";
import type { QuizMultiBlock as QuizMultiBlockType } from "@stars-factory/shared";

type Props = {
  block: QuizMultiBlockType;
  onAnswered: () => void;
};

export function QuizMultiBlock({ block, onAnswered }: Props) {
  const [selected, setSelected] = React.useState<Set<string>>(new Set());
  const [submitted, setSubmitted] = React.useState(false);

  const correct = new Set(block.correct_answers);
  const isFullyCorrect =
    selected.size === correct.size &&
    [...selected].every((s) => correct.has(s));

  function toggle(opt: string) {
    if (submitted) return;
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(opt) ? next.delete(opt) : next.add(opt);
      return next;
    });
  }

  function handleSubmit() {
    if (selected.size === 0) return;
    setSubmitted(true);
    onAnswered();
  }

  return (
    <div
      className="rounded-2xl border p-6"
      style={{
        background: "rgba(26,31,51,0.6)",
        backdropFilter: "blur(12px)",
        borderColor: submitted
          ? isFullyCorrect ? "rgba(16,185,129,0.4)" : "rgba(239,68,68,0.4)"
          : "rgba(108,92,231,0.2)",
      }}
    >
      <div className="mb-1 flex items-center gap-2">
        <HelpCircle className="size-4 text-cyan-400" />
        <span className="text-xs font-medium uppercase tracking-widest text-cyan-400">
          Quiz — plusieurs réponses
        </span>
      </div>
      <p className="mb-5 text-sm font-semibold text-white">{block.question}</p>

      <div className="space-y-2">
        {block.options.map((opt) => {
          const isSelected = selected.has(opt);
          const isRight = correct.has(opt);

          let borderColor = "rgba(255,255,255,0.08)";
          let bg = "rgba(255,255,255,0.02)";
          if (submitted && isRight) { borderColor = "rgba(16,185,129,0.6)"; bg = "rgba(16,185,129,0.08)"; }
          else if (submitted && isSelected && !isRight) { borderColor = "rgba(239,68,68,0.6)"; bg = "rgba(239,68,68,0.08)"; }
          else if (!submitted && isSelected) { borderColor = "rgba(34,211,238,0.6)"; bg = "rgba(34,211,238,0.06)"; }

          return (
            <button
              key={opt}
              type="button"
              disabled={submitted}
              onClick={() => toggle(opt)}
              className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm transition"
              style={{ border: `1px solid ${borderColor}`, background: bg }}
            >
              <span
                className="flex size-5 shrink-0 items-center justify-center rounded border"
                style={{ borderColor, background: isSelected && !submitted ? "rgba(34,211,238,0.15)" : "transparent" }}
              >
                {submitted && isRight && <CheckCircle className="size-4 text-emerald-400" />}
                {submitted && isSelected && !isRight && <XCircle className="size-4 text-red-400" />}
                {!submitted && isSelected && <span className="size-2 rounded-sm bg-cyan-400" />}
              </span>
              <span className="text-white/80">{opt}</span>
            </button>
          );
        })}
      </div>

      {!submitted && (
        <Button className="mt-4 w-full rounded-xl" onClick={handleSubmit} disabled={selected.size === 0}>
          Valider
        </Button>
      )}

      {submitted && (
        <div
          className="mt-4 rounded-xl p-4 text-sm"
          style={{
            background: isFullyCorrect ? "rgba(16,185,129,0.08)" : "rgba(239,68,68,0.08)",
            border: `1px solid ${isFullyCorrect ? "rgba(16,185,129,0.25)" : "rgba(239,68,68,0.25)"}`,
          }}
        >
          <p className="mb-1 font-semibold" style={{ color: isFullyCorrect ? "rgb(52,211,153)" : "rgb(252,165,165)" }}>
            {isFullyCorrect ? "✓ Parfait !" : "✗ Pas tout à fait — voici les bonnes réponses."}
          </p>
          <p className="text-white/60">{block.explanation}</p>
        </div>
      )}
    </div>
  );
}
