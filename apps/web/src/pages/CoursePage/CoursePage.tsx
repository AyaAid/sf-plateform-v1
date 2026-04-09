import { useNavigate, useParams } from "react-router-dom";
import { ArrowRight, BookOpen, Clock, GraduationCap, Sparkles } from "lucide-react";
import { HudFrame } from "@/shared/ui/HudFrame";
import { Button } from "@/shared/ui/Button";
import { cn } from "@/shared/cn";
import { useCourse } from "@/hooks/useCourse";

export function CoursePage() {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const { data: course, isLoading, isError } = useCourse(courseId);

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
            <h1 className="text-foreground">{isError ? "Impossible de charger ce cours." : "Course not found"}</h1>
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
                {firstAvailableChapter && (
                  <Button
                    className="rounded-xl"
                    onClick={() => navigate(`/app/courses/${course.id}/chapters/${firstAvailableChapter.id}`)}
                  >
                    Commencer
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                )}
                <Button variant="secondary" className="rounded-xl" onClick={() => navigate("/app/catalog")}>
                  <BookOpen className="h-4 w-4" />
                  Catalogue
                </Button>
              </div>
            </div>
          </HudFrame>
        </div>

        {/* Contenu : capsules → modules → chapters */}
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
                    const isLocked = mod.isLocked;

                    return (
                      <HudFrame
                        key={ch.id}
                        className={cn("p-5", isLocked && "opacity-60")}
                      >
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <GraduationCap className="h-4 w-4 text-secondary" />
                              <div className="truncate text-sm font-medium text-foreground">
                                {ch.title}
                              </div>
                              <span
                                className={cn(
                                  "ml-2 rounded-full border px-3 py-1 text-[11px] text-foreground",
                                  isLocked
                                    ? "border-white/10 bg-white/[0.03]"
                                    : "border-primary/20 bg-primary/10"
                                )}
                              >
                                {isLocked ? "Verrouillé" : "Disponible"}
                              </span>
                            </div>
                            {ch.estMin && (
                              <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                                <Clock className="h-4 w-4 text-primary" />
                                {ch.estMin} min
                              </div>
                            )}
                          </div>

                          <Button
                            className="rounded-xl"
                            variant={isLocked ? "ghost" : "secondary"}
                            disabled={isLocked}
                            onClick={() => navigate(`/app/courses/${course.id}/chapters/${ch.id}`)}
                          >
                            {isLocked ? "Verrouillé" : "Ouvrir"}
                            {!isLocked && <ArrowRight className="ml-2 h-4 w-4" />}
                          </Button>
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
