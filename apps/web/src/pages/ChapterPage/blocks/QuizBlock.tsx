import React from "react";
import { CheckCircle, XCircle, HelpCircle } from "lucide-react";
import { Button } from "@/shared/ui/Button";
import type { QuizBlock as QuizBlockType } from "@stars-factory/shared";

type Props = {
  block: QuizBlockType;
  onAnswered: () => void;
};

export function QuizBlock({ block, onAnswered }: Props) {
  const [selected, setSelected] = React.useState<string | null>(null);
  const [submitted, setSubmitted] = React.useState(false);

  const isCorrect = selected === block.correct_answer;

  function handleSubmit() {
    if (!selected) return;
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
          ? isCorrect ? "rgba(16,185,129,0.4)" : "rgba(239,68,68,0.4)"
          : "rgba(108,92,231,0.2)",
      }}
    >
      <div className="mb-1 flex items-center gap-2">
        <HelpCircle className="size-4 text-violet-400" />
        <span className="text-xs font-medium uppercase tracking-widest text-violet-400">Quiz</span>
      </div>
      <p className="mb-5 text-sm font-semibold text-white">{block.question}</p>

      <div className="space-y-2">
        {block.options.map((opt) => {
          const isSelected = selected === opt;
          const showResult = submitted;
          const isRight = opt === block.correct_answer;

          let borderColor = "rgba(255,255,255,0.08)";
          let bg = "rgba(255,255,255,0.02)";
          if (showResult && isRight) { borderColor = "rgba(16,185,129,0.6)"; bg = "rgba(16,185,129,0.08)"; }
          else if (showResult && isSelected && !isRight) { borderColor = "rgba(239,68,68,0.6)"; bg = "rgba(239,68,68,0.08)"; }
          else if (!showResult && isSelected) { borderColor = "rgba(139,92,246,0.6)"; bg = "rgba(139,92,246,0.08)"; }

          return (
            <button
              key={opt}
              type="button"
              disabled={submitted}
              onClick={() => setSelected(opt)}
              className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm transition"
              style={{ border: `1px solid ${borderColor}`, background: bg }}
            >
              <span
                className="flex size-5 shrink-0 items-center justify-center rounded-full border text-xs font-bold"
                style={{ borderColor, color: showResult && isRight ? "rgb(16,185,129)" : showResult && isSelected ? "rgb(239,68,68)" : isSelected ? "rgb(139,92,246)" : "rgba(255,255,255,0.3)" }}
              >
                {showResult && isRight ? <CheckCircle className="size-4" /> : showResult && isSelected && !isRight ? <XCircle className="size-4" /> : null}
              </span>
              <span className="text-white/80">{opt}</span>
            </button>
          );
        })}
      </div>

      {!submitted && (
        <Button className="mt-4 w-full rounded-xl" onClick={handleSubmit} disabled={!selected}>
          Valider
        </Button>
      )}

      {submitted && (
        <div
          className="mt-4 rounded-xl p-4 text-sm"
          style={{
            background: isCorrect ? "rgba(16,185,129,0.08)" : "rgba(239,68,68,0.08)",
            border: `1px solid ${isCorrect ? "rgba(16,185,129,0.25)" : "rgba(239,68,68,0.25)"}`,
          }}
        >
          <p className="mb-1 font-semibold" style={{ color: isCorrect ? "rgb(52,211,153)" : "rgb(252,165,165)" }}>
            {isCorrect ? "✓ Bonne réponse !" : "✗ Pas tout à fait."}
          </p>
          <p className="text-white/60">{block.explanation}</p>
        </div>
      )}
    </div>
  );
}
