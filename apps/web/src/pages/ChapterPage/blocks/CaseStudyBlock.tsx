import React from "react";
import { FileSearch, ChevronDown } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { CaseStudyBlock as CaseStudyBlockType } from "@stars-factory/shared";

type Props = { block: CaseStudyBlockType };

export function CaseStudyBlock({ block }: Props) {
  const [correctionOpen, setCorrectionOpen] = React.useState(false);

  return (
    <div
      className="rounded-2xl border p-6"
      style={{
        background: "rgba(26,31,51,0.6)",
        backdropFilter: "blur(12px)",
        borderColor: "rgba(34,211,238,0.2)",
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

      {/* Questions */}
      <div className="mb-5 space-y-3">
        <p className="text-xs font-semibold uppercase tracking-widest text-white/40">Questions</p>
        {block.questions.map((q, i) => (
          <div
            key={i}
            className="flex gap-3 rounded-xl p-4 text-sm text-white/70"
            style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}
          >
            <span className="shrink-0 text-xs font-bold text-cyan-400/70">{i + 1}.</span>
            <span>{q}</span>
          </div>
        ))}
      </div>

      {/* Correction toggle */}
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
        <span className="font-medium">Voir la correction</span>
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
  );
}
