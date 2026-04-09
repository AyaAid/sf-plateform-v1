import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ArrowLeft, ArrowRight, BookOpen, Check, Clock, Lock } from "lucide-react";
import { HudFrame } from "@/shared/ui/HudFrame";
import { Button } from "@/shared/ui/Button";
import { Badge } from "@/shared/ui/Badge";
import { cn } from "@/shared/cn";
import { apiClient } from "@/lib/apiClient";
import { useChapter } from "@/hooks/useChapter";
import type { ProgressRecord } from "@stars-factory/shared";

const STATUS_LABEL: Record<string, string> = {
  NOT_STARTED: "Non commencé",
  IN_PROGRESS: "En cours",
  COMPLETED: "Terminé",
};

const STATUS_CLASS: Record<string, string> = {
  NOT_STARTED: "border-white/10 bg-white/[0.03] text-white/50",
  IN_PROGRESS: "border-primary/20 bg-primary/10 text-foreground",
  COMPLETED: "border-secondary/20 bg-secondary/10 text-secondary",
};

export function ChapterPage() {
  const { courseId, chapterId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useChapter(chapterId);

  const markComplete = useMutation({
    mutationFn: () =>
      apiClient.put<ProgressRecord>("/progress", {
        chapterId,
        status: "COMPLETED",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["progress"] });
    },
  });

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
        <div className="pointer-events-none absolute inset-0 opacity-40 space-grid" />
        <div className="relative mx-auto max-w-4xl">
          <HudFrame className="p-6">
            <h1 className="text-foreground">Chapitre introuvable</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Ce chapitre n'existe pas ou est inaccessible.
            </p>
            <div className="mt-4">
              <Button variant="secondary" className="rounded-xl" onClick={() => navigate(`/app/courses/${courseId}`)}>
                Retour au cours
              </Button>
            </div>
          </HudFrame>
        </div>
      </div>
    );
  }

  const { chapter, markdown } = data;
  const status = markComplete.data?.status ?? "NOT_STARTED";
  const isCompleted = status === "COMPLETED";

  return (
    <div className="relative p-8">
      <div className="pointer-events-none absolute inset-0 opacity-40 space-grid" />

      <div className="relative mx-auto max-w-5xl space-y-6">
        {/* Header */}
        <HudFrame className="p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <BookOpen className="h-4 w-4 text-secondary" />
                Cours • Chapitre {chapter.sortOrder}
                {chapter.estMin && (
                  <>
                    <span className="mx-2 opacity-40">•</span>
                    <Clock className="h-4 w-4 text-primary" />
                    {chapter.estMin} min
                  </>
                )}
              </div>

              <h1 className="mt-2 text-foreground">{chapter.title}</h1>

              <div className="mt-2">
                <Badge className={cn("border text-xs", STATUS_CLASS[status])}>
                  {isCompleted ? (
                    <Check className="mr-1 h-3 w-3" />
                  ) : (
                    <Lock className="mr-1 h-3 w-3" />
                  )}
                  {STATUS_LABEL[status]}
                </Badge>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="secondary"
                className="rounded-xl"
                onClick={() => navigate(`/app/courses/${courseId}`)}
              >
                <ArrowLeft className="h-4 w-4" />
                Cours
              </Button>
              <Button
                variant="secondary"
                className="rounded-xl"
                onClick={() => navigate(`/app/courses/${courseId}/chapters/${chapterId}/immersive`)}
              >
                Immersive
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button
                className="rounded-xl"
                disabled={isCompleted || markComplete.isPending}
                onClick={() => markComplete.mutate()}
              >
                {isCompleted ? "Terminé" : "Marquer comme terminé"}
                {!isCompleted && <Check className="ml-2 h-4 w-4" />}
              </Button>
            </div>
          </div>
        </HudFrame>

        {/* Contenu markdown */}
        <HudFrame className="p-6">
          <div className="prose prose-invert prose-sm max-w-none">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {markdown}
            </ReactMarkdown>
          </div>
        </HudFrame>
      </div>
    </div>
  );
}
