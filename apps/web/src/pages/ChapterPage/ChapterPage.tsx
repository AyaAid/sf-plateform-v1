import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight, BookOpen, Check, Clock, Zap } from "lucide-react";
import { HudFrame } from "@/shared/ui/HudFrame";
import { Button } from "@/shared/ui/Button";
import { apiClient } from "@/lib/apiClient";
import { useChapter } from "@/hooks/useChapter";
import { useCourse } from "@/hooks/useCourse";
import { BlockRenderer, isInteractiveBlock } from "./blocks/BlockRenderer";
import { useBlockProgress, useMarkBlockAnswered } from "@/hooks/useBlockProgress";
import { useProgress } from "@/hooks/useProgress";
import type { ChapterSummary, ProgressRecord } from "@stars-factory/shared";

const BLOCK_LABELS: Record<string, string> = {
  text: "Lecture",
  quiz: "Quiz",
  quiz_multi: "Quiz",
  "quiz-text": "Réponse libre",
  mission: "Mission",
  "case-study": "Étude de cas",
};

export function ChapterPage() {
  const { courseId, chapterId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useChapter(chapterId);
  const { data: blockProgressData } = useBlockProgress(chapterId);
  const { data: progressRecords = [], isFetched: progressLoaded } = useProgress();
  const { data: course } = useCourse(courseId);
  const markBlockAnswered = useMarkBlockAnswered();

  const alreadyCompleted = progressRecords.some(
    (p) => p.chapterId === chapterId && p.status === "COMPLETED"
  );

  const [currentBlockIndex, setCurrentBlockIndex] = React.useState(0);
  const [answeredSet, setAnsweredSet] = React.useState<Set<number>>(new Set());

  // Restore answered blocks from DB
  React.useEffect(() => {
    if (!data || !blockProgressData) return;
    const answeredIds = new Set(blockProgressData.map((r) => r.blockId));
    const restoredIndices = data.blocks
      .map((block, i) => (block.id && answeredIds.has(block.id) ? i : -1))
      .filter((i) => i !== -1);
    if (restoredIndices.length > 0) {
      setAnsweredSet(new Set(restoredIndices));
    }
  }, [!!data, !!blockProgressData]); // eslint-disable-line react-hooks/exhaustive-deps

  const saveProgress = useMutation({
    mutationFn: (payload: { status: string; score?: number }) =>
      apiClient.put<ProgressRecord>("/progress", { chapterId, ...payload }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["progress"] });
      queryClient.invalidateQueries({ queryKey: ["enrollments"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
    },
  });

  const markComplete = useMutation({
    mutationFn: () =>
      apiClient.put<ProgressRecord>("/progress", { chapterId, status: "COMPLETED", score: 100 }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["progress"] });
      queryClient.invalidateQueries({ queryKey: ["enrollments"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
    },
  });

  const interactiveIndices = React.useMemo(() => {
    if (!data) return [];
    return data.blocks
      .map((block, i) => (isInteractiveBlock(block) ? i : -1))
      .filter((i) => i !== -1);
  }, [data]);

  const allAnswered =
    interactiveIndices.length > 0 &&
    interactiveIndices.every((i) => answeredSet.has(i));

  const isCompleted = alreadyCompleted || markComplete.isSuccess;

  // Mark IN_PROGRESS once
  React.useEffect(() => {
    if (data && progressLoaded && !alreadyCompleted) {
      saveProgress.mutate({ status: "IN_PROGRESS" });
    }
  }, [!!data, progressLoaded, alreadyCompleted]); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-complete when all interactive blocks are answered
  React.useEffect(() => {
    if (allAnswered && !isCompleted && !markComplete.isPending) {
      markComplete.mutate();
    }
  }, [allAnswered, isCompleted]); // eslint-disable-line react-hooks/exhaustive-deps

  // Find next chapter in the same capsule
  const nextChapter = React.useMemo((): ChapterSummary | null => {
    if (!course) return null;
    for (const capsule of course.capsules) {
      const allChapters = capsule.modules.flatMap((m) => m.chapters);
      const idx = allChapters.findIndex((ch) => ch.id === chapterId);
      if (idx !== -1) {
        return idx < allChapters.length - 1 ? allChapters[idx + 1] : null;
      }
    }
    return null;
  }, [course, chapterId]);

  function handleAnswered(blockIndex: number) {
    setAnsweredSet((prev) => {
      const next = new Set(prev);
      next.add(blockIndex);
      const score =
        interactiveIndices.length > 0
          ? Math.round((next.size / interactiveIndices.length) * 100)
          : 0;
      saveProgress.mutate({ status: "IN_PROGRESS", score });
      const block = data?.blocks[blockIndex];
      if (block?.id && chapterId) {
        markBlockAnswered.mutate({ chapterId, blockId: block.id });
      }
      return next;
    });
  }

  function handleTerminer() {
    if (!isCompleted && !markComplete.isPending) {
      markComplete.mutate();
    }
    const score = interactiveIndices.length > 0
      ? Math.round((answeredSet.size / interactiveIndices.length) * 100)
      : 100;
    navigate(`/app/courses/${courseId}/chapters/${chapterId}/recap`, {
      state: {
        chapterTitle: data?.frontmatter?.title ?? "",
        score,
        answeredCount: answeredSet.size,
        totalInteractive: interactiveIndices.length,
        wasAlreadyCompleted: alreadyCompleted,
      },
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
  const totalBlocks = data.blocks.length;
  const isFirstBlock = currentBlockIndex === 0;
  const isLastBlock = currentBlockIndex === totalBlocks - 1;
  const currentBlock = data.blocks[currentBlockIndex];
  const isCurrentInteractive = isInteractiveBlock(currentBlock);
  const isCurrentAnswered = answeredSet.has(currentBlockIndex);
  const canGoNext = alreadyCompleted || !isCurrentInteractive || isCurrentAnswered;

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
                <Button
                  variant="secondary"
                  size="sm"
                  className="rounded-xl"
                  disabled={!nextChapter}
                  onClick={() => nextChapter && navigate(`/app/courses/${courseId}/chapters/${nextChapter.id}`)}
                >
                  Module suivant
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </div>

              {isCompleted ? (
                <div
                  className="flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium"
                  style={{ background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.3)", color: "rgb(52,211,153)" }}
                >
                  <Check className="size-3" />
                  Module terminé
                </div>
              ) : interactiveIndices.length > 0 ? (
                <div
                  className="flex items-center gap-1.5 rounded-full px-3 py-1 text-xs"
                  style={{ background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.2)", color: "rgba(255,255,255,0.5)" }}
                >
                  <Zap className="size-3 text-violet-400" />
                  {answeredSet.size} / {interactiveIndices.length} exercices
                </div>
              ) : null}
            </div>
          </div>
        </HudFrame>

        {/* ── Barre de progression par blocs ── */}
        <div className="space-y-2">
          <div className="flex items-center gap-1.5">
            {data.blocks.map((block, i) => {
              const answered = answeredSet.has(i);
              const isCurrent = i === currentBlockIndex;
              const interactive = isInteractiveBlock(block);
              return (
                <div
                  key={block.id ?? i}
                  className="h-1 flex-1 rounded-full transition-all duration-300"
                  style={{
                    background: answered
                      ? "rgb(16,185,129)"
                      : isCurrent
                      ? interactive ? "rgb(139,92,246)" : "rgba(255,255,255,0.8)"
                      : "rgba(255,255,255,0.12)",
                  }}
                />
              );
            })}
          </div>
          <div className="flex items-center justify-between text-xs text-white/35">
            <span>{BLOCK_LABELS[currentBlock.type] ?? "Bloc"}</span>
            <span>{currentBlockIndex + 1} / {totalBlocks}</span>
          </div>
        </div>

        {/* ── Bloc courant ── */}
        <BlockRenderer
          key={currentBlock.id ?? currentBlockIndex}
          block={currentBlock}
          onAnswered={() => handleAnswered(currentBlockIndex)}
          alreadyAnswered={answeredSet.has(currentBlockIndex)}
        />

        {/* ── Navigation ── */}
        <div className="flex gap-3">
          <Button
            variant="secondary"
            className="rounded-xl"
            onClick={() => setCurrentBlockIndex((i) => i - 1)}
            disabled={isFirstBlock}
          >
            <ArrowLeft className="h-4 w-4" />
            Précédent
          </Button>

          {isLastBlock ? (
            <Button
              className="flex-1 rounded-xl"
              onClick={handleTerminer}
              disabled={!canGoNext}
              style={
                isCompleted
                  ? { background: "rgba(16,185,129,0.2)", borderColor: "rgba(16,185,129,0.4)", color: "rgb(52,211,153)" }
                  : {}
              }
            >
              {isCompleted ? (
                <><Check className="mr-2 h-4 w-4" />Terminé</>
              ) : (
                "Terminer le module"
              )}
            </Button>
          ) : (
            <Button
              className="flex-1 rounded-xl"
              onClick={() => setCurrentBlockIndex((i) => i + 1)}
              disabled={!canGoNext}
            >
              Suivant
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>

      </div>
    </div>
  );
}
