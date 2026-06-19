import { useNavigate, useParams } from "react-router-dom";
import { ArrowRight, Check, Clock, GraduationCap, Sparkles } from "lucide-react";
import { HudFrame } from "@/shared/ui/HudFrame";
import { Button } from "@/shared/ui/Button";
import { Progress } from "@/shared/ui/Progress";
import { cn } from "@/shared/cn";
import { useCourse } from "@/hooks/useCourse";
import { useEnroll, useEnrollments } from "@/hooks/useEnrollments";
import { useProgress } from "@/hooks/useProgress";

export function CoursePage() {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const { data: course, isLoading, isError } = useCourse(courseId);
  const { data: enrollments } = useEnrollments();
  const { data: progressRecords = [] } = useProgress();
  const enroll = useEnroll();

  const isEnrolled = enrollments?.some((e) => e.courseId === course?.id) ?? false;

  if (isLoading) {
    return (
      <div className="p-8 text-center text-sm text-white/50">
        Chargement du cours...
      </div>
    );
  }

  if (isError || !course) {
    return (
      <div className="relative p-8">
        <div className="pointer-events-none absolute inset-0 opacity-40 space-grid" />
        <div className="relative mx-auto max-w-4xl">
          <HudFrame className="p-6">
            <h1 className="text-foreground">{isError ? "Impossible de charger ce cours." : "Cours introuvable"}</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Vérifie que l'identifiant du cours est correct.
            </p>
            <div className="mt-4">
              <Button variant="secondary" className="rounded-xl" onClick={() => navigate("/app/catalog")}>
                Retour au catalogue
              </Button>
            </div>
          </HudFrame>
        </div>
      </div>
    );
  }

  // Premier chapitre disponible (non verrouillé)
  const firstAvailableChapter = course.capsules
    .flatMap((cap) => cap.modules)
    .filter((mod) => !mod.isLocked)
    .flatMap((mod) => mod.chapters)[0];

  return (
    <div className="relative p-8">
      <div className="pointer-events-none absolute inset-0 opacity-40 space-grid" />

      <div className="relative mx-auto max-w-7xl space-y-8">
        {/* Header */}
        <div className="relative">
          <div className="absolute -left-4 top-0 h-full w-1 bg-gradient-to-b from-primary via-secondary to-transparent opacity-50" />
          <HudFrame className="p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-foreground">{course.title}</h1>
                  {course.level && (
                    <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs text-foreground">
                      <Sparkles className="h-3.5 w-3.5 text-secondary" />
                      {course.level}
                    </span>
                  )}
                </div>
                <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
                  {course.description}
                </p>
              </div>

              <div className="flex gap-2">
                {isEnrolled ? (
                  <span className="inline-flex items-center gap-2 rounded-xl border border-green-500/30 bg-green-500/10 px-4 py-2 text-sm text-green-400">
                    <Check className="h-4 w-4" />
                    Inscrit
                  </span>
                ) : (
                  <div className="flex flex-col items-end gap-1">
                    <Button
                      className="rounded-xl"
                      onClick={() => course.id && enroll.mutate(course.id)}
                      disabled={enroll.isPending}
                    >
                      {enroll.isPending ? "Inscription..." : "S'inscrire"}
                    </Button>
                    {enroll.error && (
                      <span className="text-xs text-red-400">{(enroll.error as Error).message}</span>
                    )}
                  </div>
                )}
                {isEnrolled && course.slug === "microgravity" && firstAvailableChapter && (
                  <Button
                    variant="ghost"
                    className="rounded-xl"
                    onClick={() => navigate(`/app/courses/${course.id}/chapters/${firstAvailableChapter.id}/immersive`)}
                  >
                    Mode immersif
                  </Button>
                )}
              </div>
            </div>
          </HudFrame>
        </div>

        {/* Contenu : capsules → modules → chapters */}
        {!isEnrolled && (
          <HudFrame className="p-5 border-primary/30">
            <p className="text-sm text-muted-foreground">
              Inscris-toi pour accéder aux modules de ce cours.
            </p>
          </HudFrame>
        )}
        {course.capsules.map((capsule) => (
          <div key={capsule.id} className="space-y-4">
            <div className="flex items-center gap-3">
              <h2 className="text-foreground">{capsule.title}</h2>
              <div className="h-px flex-1 bg-gradient-to-r from-primary/30 to-transparent" />
            </div>

            {capsule.modules.map((mod) => (
              <div key={mod.id} className="space-y-3">
                <p className="text-xs font-medium uppercase tracking-widest text-white/40">
                  {mod.title}
                </p>

                <div className="grid gap-3">
                  {mod.chapters.map((ch) => {
                    const isLocked = mod.isLocked || !isEnrolled;
                    const prog = progressRecords.find((p) => p.chapterId === ch.id);
                    const isCompleted = prog?.status === "COMPLETED";
                    const isInProgress = prog?.status === "IN_PROGRESS";
                    const chScore = prog?.score ?? 0;

                    return (
                      <HudFrame
                        key={ch.id}
                        className={cn("p-5", isLocked && "opacity-60")}
                        accent={isCompleted ? "none" : "purple"}
                      >
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <GraduationCap className="h-4 w-4 text-secondary shrink-0" />
                              <div className="truncate text-sm font-medium text-foreground">
                                {ch.title}
                              </div>
                              {isCompleted ? (
                                <span className="ml-2 inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-[11px] text-emerald-400 shrink-0">
                                  <Check className="h-3 w-3" /> Terminé
                                </span>
                              ) : isInProgress ? (
                                <span className="ml-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-[11px] text-amber-400 shrink-0">
                                  En cours
                                </span>
                              ) : (
                                <span
                                  className={cn(
                                    "ml-2 rounded-full border px-3 py-1 text-[11px] text-foreground shrink-0",
                                    isLocked ? "border-white/10 bg-white/[0.03]" : "border-primary/20 bg-primary/10"
                                  )}
                                >
                                  {!isEnrolled ? "Inscription requise" : isLocked ? "Verrouillé" : "Disponible"}
                                </span>
                              )}
                            </div>

                            <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                              {ch.estMin && (
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3.5 w-3.5" />
                                  {ch.estMin} min
                                </span>
                              )}
                            </div>

                            {isInProgress && (
                              <div className="mt-3 space-y-1">
                                <div className="flex justify-between text-xs text-white/30">
                                  <span>Progression</span>
                                  <span>{chScore}%</span>
                                </div>
                                <Progress value={chScore} />
                              </div>
                            )}
                          </div>

                          <div className="flex shrink-0 gap-2">
                            <Button
                              className="rounded-xl"
                              variant={isLocked ? "ghost" : "secondary"}
                              disabled={isLocked}
                              onClick={() => navigate(`/app/courses/${course.id}/chapters/${ch.id}`)}
                            >
                              {isLocked ? "Verrouillé" : isCompleted ? "Revoir" : isInProgress ? "Continuer" : "Ouvrir"}
                              {!isLocked && <ArrowRight className="ml-2 h-4 w-4" />}
                            </Button>
                          </div>
                        </div>
                      </HudFrame>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
