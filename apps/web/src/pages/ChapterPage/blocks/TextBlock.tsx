import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { TextBlock as TextBlockType } from "@stars-factory/shared";

type Props = { block: TextBlockType };

export function TextBlock({ block }: Props) {
  return (
    <div
      className="rounded-2xl border p-6"
      style={{
        background: "rgba(26,31,51,0.6)",
        backdropFilter: "blur(12px)",
        borderColor: "rgba(108,92,231,0.15)",
      }}
    >
      {block.title && (
        <h2 className="mb-4 text-lg font-semibold text-white">{block.title}</h2>
      )}
      <div className="prose prose-invert prose-sm max-w-none leading-7 text-white/80
        prose-headings:text-white prose-headings:font-semibold
        prose-strong:text-white prose-strong:font-semibold
        prose-li:text-white/80 prose-ol:text-white/80
        prose-code:text-cyan-300 prose-code:bg-white/[0.06] prose-code:px-1.5 prose-code:rounded
        prose-blockquote:border-violet-500/40 prose-blockquote:text-white/60">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{block.content}</ReactMarkdown>
      </div>
    </div>
  );
}
