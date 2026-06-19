import React from "react";
import { Rocket, RefreshCw, CheckCircle } from "lucide-react";
import { Button } from "@/shared/ui/Button";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { MissionBlock as MissionBlockType } from "@stars-factory/shared";
import { AlreadyAnsweredBadge } from "./AlreadyAnsweredBadge";

type Props = {
  block: MissionBlockType;
  onAnswered: () => void;
  alreadyAnswered?: boolean;
};

type StepState = "idle" | "correct" | "wrong";

export function MissionBlock({ block, onAnswered, alreadyAnswered }: Props) {
  const [currentStep, setCurrentStep] = React.useState(0);
  const [selected, setSelected] = React.useState<string | null>(null);
  const [stepState, setStepState] = React.useState<StepState>("idle");
  const [completed, setCompleted] = React.useState(false);

  if (alreadyAnswered && !completed) return <AlreadyAnsweredBadge label="Mission" />;

  const step = block.steps[currentStep];
  const isLast = currentStep === block.steps.length - 1;

  function handleValidate() {
    if (!selected) return;
    const correct = selected === step.correct_answer;
    setStepState(correct ? "correct" : "wrong");
  }

  function handleNext() {
    if (isLast) {
      setCompleted(true);
      onAnswered();
    } else {
      setCurrentStep((s) => s + 1);
      setSelected(null);
      setStepState("idle");
    }
  }

  function handleRetry() {
    setSelected(null);
    setStepState("idle");
  }

  if (completed) {
    return (
      <div
        className="rounded-2xl border p-8 text-center"
        style={{
          background: "linear-gradient(135deg, rgba(16,185,129,0.12), rgba(6,182,212,0.08))",
          border: "1px solid rgba(16,185,129,0.3)",
          boxShadow: "0 0 40px rgba(16,185,129,0.1)",
        }}
      >
        <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl" style={{ background: "rgba(16,185,129,0.15)", boxShadow: "0 0 20px rgba(16,185,129,0.3)" }}>
          <CheckCircle className="size-7 text-emerald-400" />
        </div>
        <h3 className="mb-4 text-lg font-bold text-emerald-300">Mission accomplie !</h3>
        <div className="prose prose-invert prose-sm mx-auto max-w-none text-white/70">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{block.mission_success}</ReactMarkdown>
        </div>
      </div>
    );
  }

  return (
    <div
      className="rounded-2xl border p-6"
      style={{
        background: "rgba(26,31,51,0.6)",
        backdropFilter: "blur(12px)",
        borderColor: "rgba(249,115,22,0.25)",
      }}
    >
      {/* Header */}
      <div className="mb-1 flex items-center gap-2">
        <Rocket className="size-4 text-orange-400" />
        <span className="text-xs font-medium uppercase tracking-widest text-orange-400">Mission interactive</span>
      </div>
      <h3 className="mb-2 text-base font-semibold text-white">{block.title}</h3>

      {/* Scenario — only on first step */}
      {currentStep === 0 && (
        <div
          className="mb-5 rounded-xl p-4 text-sm text-white/60"
          style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
        >
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{block.scenario}</ReactMarkdown>
        </div>
      )}

      {/* Progress dots */}
      <div className="mb-5 flex items-center gap-1.5">
        {block.steps.map((_, i) => (
          <span
            key={i}
            className="h-1.5 rounded-full transition-all"
            style={{
              width: i === currentStep ? "1.5rem" : "0.375rem",
              background: i < currentStep ? "rgb(16,185,129)" : i === currentStep ? "rgb(249,115,22)" : "rgba(255,255,255,0.15)",
            }}
          />
        ))}
        <span className="ml-2 text-xs text-white/30">
          {currentStep + 1} / {block.steps.length}
        </span>
      </div>

      {/* Prompt */}
      <p className="mb-4 text-sm font-semibold text-white">{step.prompt}</p>

      {/* Options */}
      <div className="space-y-2">
        {step.options.map((opt) => {
          const isSelected = selected === opt;
          const isCorrect = opt === step.correct_answer;

          let borderColor = "rgba(255,255,255,0.08)";
          let bg = "rgba(255,255,255,0.02)";

          if (stepState !== "idle" && isCorrect) {
            borderColor = "rgba(16,185,129,0.6)";
            bg = "rgba(16,185,129,0.08)";
          } else if (stepState === "wrong" && isSelected) {
            borderColor = "rgba(239,68,68,0.6)";
            bg = "rgba(239,68,68,0.08)";
          } else if (stepState === "idle" && isSelected) {
            borderColor = "rgba(249,115,22,0.6)";
            bg = "rgba(249,115,22,0.06)";
          }

          return (
            <button
              key={opt}
              type="button"
              disabled={stepState !== "idle"}
              onClick={() => setSelected(opt)}
              className="w-full rounded-xl px-4 py-3 text-left text-sm text-white/80 transition"
              style={{ border: `1px solid ${borderColor}`, background: bg }}
            >
              {opt}
            </button>
          );
        })}
      </div>

      {/* Feedback */}
      {stepState !== "idle" && (
        <div
          className="mt-4 rounded-xl p-4 text-sm"
          style={{
            background: stepState === "correct" ? "rgba(16,185,129,0.08)" : "rgba(239,68,68,0.08)",
            border: `1px solid ${stepState === "correct" ? "rgba(16,185,129,0.25)" : "rgba(239,68,68,0.25)"}`,
          }}
        >
          <p className="text-white/70">
            {stepState === "correct" ? step.feedback_correct : step.feedback_wrong}
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="mt-4 flex gap-2">
        {stepState === "idle" && (
          <Button className="flex-1 rounded-xl" onClick={handleValidate} disabled={!selected}>
            Valider
          </Button>
        )}
        {stepState === "correct" && (
          <Button className="flex-1 rounded-xl" onClick={handleNext} style={{ background: "rgba(16,185,129,0.2)", borderColor: "rgba(16,185,129,0.4)", color: "rgb(52,211,153)" }}>
            {isLast ? "Terminer la mission" : "Étape suivante →"}
          </Button>
        )}
        {stepState === "wrong" && (
          <Button className="flex-1 rounded-xl" onClick={handleRetry} style={{ background: "rgba(239,68,68,0.1)", borderColor: "rgba(239,68,68,0.3)", color: "rgb(252,165,165)" }}>
            <RefreshCw className="mr-2 size-4" />
            Réessayer
          </Button>
        )}
      </div>
    </div>
  );
}
