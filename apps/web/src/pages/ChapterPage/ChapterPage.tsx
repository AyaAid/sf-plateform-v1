import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight, BookOpen, Check, Clock, Zap } from "lucide-react";
import { HudFrame } from "@/shared/ui/HudFrame";
import { Button } from "@/shared/ui/Button";
import { apiClient } from "@/lib/apiClient";
import { useChapter } from "@/hooks/useChapter";
import { BlockRenderer, isInteractiveBlock } from "./blocks/BlockRenderer";
import type { ProgressRecord } from "@stars-factory/shared";

export function ChapterPage() {
  const { courseId, chapterId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useChapter(chapterId);

  // Track which interactive block indices have been answered
  const [answeredSet, setAnsweredSet] = React.useState<Set<number>>(new Set());

  const markComplete = useMutation({
    mutationFn: () =>
      apiClient.put<ProgressRecord>("/progress", { chapterId, status: "COMPLETED" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["progress"] });
    },
  });

  // Derive interactive block indices once data is loaded
  const interactiveIndices = React.useMemo(() => {
    if (!data) return [];
    return data.blocks
      .map((block, i) => (isInteractiveBlock(block) ? i : -1))
      .filter((i) => i !== -1);
  }, [data]);

  const allAnswered =
    interactiveIndices.length > 0 &&
    interactiveIndices.every((i) => answeredSet.has(i));

  const isCompleted = markComplete.isSuccess || markComplete.data?.status === "COMPLETED";

  // Auto-trigger COMPLETED when all interactive blocks are answered
  React.useEffect(() => {
    if (allAnswered && !isCompleted && !markComplete.isPending) {
      markComplete.mutate();
    }
  }, [allAnswered]); // eslint-disable-line react-hooks/exhaustive-deps

  function handleAnswered(blockIndex: number) {
    setAnsweredSet((prev) => {
      const next = new Set(prev);
      next.add(blockIndex);
      return next;
    });
  }

  if (!courseId || !chapterId) return null;

  if (isLoading) {
    return (
      <div className="p-8 text-center text-sm text-white/50">
        Chargement du chapitre...
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="relative p-8">
        <div className="relative mx-auto max-w-4xl">
          <HudFrame className="p-6">
            <h1 className="text-foreground">Chapitre introuvable</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Ce chapitre n'existe pas ou est inaccessible.
            </p>
            <div className="mt-4">
              <Button variant="secondary" className="rounded-xl" onClick={() => navigate(`/app/courses/${courseId}`)}>
                <ArrowLeft className="h-4 w-4" />
                Retour au cours
              </Button>
            </div>
          </HudFrame>
        </div>
      </div>
    );
  }

  const { chapter, frontmatter } = data;
  const answeredCount = answeredSet.size;
  const totalInteractive = interactiveIndices.length;

  return (
    <div className="relative p-8">
      <div className="pointer-events-none absolute inset-0 opacity-40 space-grid" />

      <div className="relative mx-auto max-w-3xl space-y-5">

        {/* ── Header ── */}
        <HudFrame className="p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <BookOpen className="h-3.5 w-3.5 text-secondary" />
                <span>{frontmatter.capsule}</span>
                <span className="opacity-30">•</span>
                <span>{frontmatter.chapter}</span>
                {chapter.estMin && (
                  <>
                    <span className="opacity-30">•</span>
                    <Clock className="h-3.5 w-3.5 text-primary" />
                    <span>{chapter.estMin} min</span>
                  </>
                )}
              </div>
              <h1 className="mt-2 text-xl font-semibold text-white">{frontmatter.title}</h1>

              {/* Learning objectives */}
              {frontmatter.learning_objectives?.length > 0 && (
                <ul className="mt-3 space-y-1">
                  {frontmatter.learning_objectives.map((obj, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-white/50">
                      <span className="mt-1 size-1 shrink-0 rounded-full bg-violet-400/60" />
                      {obj}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="flex shrink-0 flex-col gap-2 sm:items-end">
              <div className="flex gap-2">
                <Button variant="secondary" size="sm" className="rounded-xl" onClick={() => navigate(`/app/courses/${courseId}`)}>
                  <ArrowLeft className="h-4 w-4" />
                  Cours
                </Button>
                <Button variant="secondary" size="sm" className="rounded-xl" onClick={() => navigate(`/app/courses/${courseId}/chapters/${chapterId}/immersive`)}>
                  Immersive
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </div>

              {/* Completion badge */}
              {isCompleted ? (
                <div
                  className="flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium"
                  style={{ background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.3)", color: "rgb(52,211,153)" }}
                >
                  <Check className="size-3" />
                  Module terminé
                </div>
              ) : totalInteractive > 0 ? (
                <div
                  className="flex items-center gap-1.5 rounded-full px-3 py-1 text-xs"
                  style={{ background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.2)", color: "rgba(255,255,255,0.5)" }}
                >
                  <Zap className="size-3 text-violet-400" />
                  {answeredCount} / {totalInteractive} exercices
                </div>
              ) : null}
            </div>
          </div>
        </HudFrame>

        {/* ── Blocks ── */}
        {data.blocks.map((block, idx) => (
          <BlockRenderer
            key={block.id ?? idx}
            block={block}
            onAnswered={() => handleAnswered(idx)}
          />
        ))}

        {/* ── Completion banner ── */}
        {isCompleted && (
          <div
            className="rounded-2xl p-6 text-center"
            style={{
              background: "linear-gradient(135deg, rgba(16,185,129,0.12), rgba(6,182,212,0.08))",
              border: "1px solid rgba(16,185,129,0.25)",
              boxShadow: "0 0 40px rgba(16,185,129,0.08)",
            }}
          >
            <Check className="mx-auto mb-2 size-8 text-emerald-400" />
            <p className="font-semibold text-emerald-300">Module complété !</p>
            <p className="mt-1 text-sm text-white/40">Tous les exercices ont été répondus.</p>
            <Button
              className="mt-4 rounded-xl"
              onClick={() => navigate(`/app/courses/${courseId}`)}
            >
              Retour au cours
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        )}

      </div>
    </div>
  );
}
