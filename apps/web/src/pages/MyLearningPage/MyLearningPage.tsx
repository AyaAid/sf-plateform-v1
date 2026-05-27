import React from "react";
import {
  ArrowRight,
  BookOpen,
  Clock,
  GraduationCap,
  Sparkles,
  Target,
  Zap,
} from "lucide-react";

import { Button } from "@/shared/ui/Button";
import { HudFrame } from "@/shared/ui/HudFrame";
import { Progress } from "@/shared/ui/Progress";
import { cn } from "@/shared/cn";
import { useNavigate } from "react-router-dom";
import { GoalModal } from "./GoalModal";
import { useGoals } from "@/hooks/useGoals";
import { useEnrollments } from "@/hooks/useEnrollments";
import { useStats } from "@/hooks/useStats";

const COURSE_GRADIENTS = [
  "bg-gradient-to-br from-primary to-secondary",
  "bg-gradient-to-br from-secondary to-primary",
  "bg-gradient-to-br from-green-500 to-emerald-600",
  "bg-gradient-to-br from-pink-500 to-purple-600",
  "bg-gradient-to-br from-orange-500 to-red-600",
  "bg-gradient-to-br from-cyan-500 to-sky-600",
];

export function MyLearningPage() {
  const navigate = useNavigate();
  const { goals, saveGoals } = useGoals();
  const [showGoalModal, setShowGoalModal] = React.useState(false);

  const { data: enrollments = [], isLoading: loadingEnrollments } = useEnrollments();
  const { data: stats, isLoading: loadingStats } = useStats();

  const inProgress = enrollments.filter((e) => e.progress > 0 && e.progress < 100);
  const allEnrolled = enrollments;

  const xp = stats?.xp ?? 0;
  const level = stats?.level ?? 1;
  const streak = stats?.streak ?? 0;
  const weeklyMinutes = stats?.weeklyMinutes ?? 0;
  const weeklyGoal = goals.daily * 7;
  const weeklyPct = weeklyGoal > 0 ? Math.min(100, Math.round((weeklyMinutes / weeklyGoal) * 100)) : 0;

  return (
    <>
      <div className="relative p-8">
        <div className="pointer-events-none absolute inset-0 opacity-40 space-grid" />

        <div className="relative mx-auto max-w-7xl space-y-8">
          <div className="relative">
            <div className="absolute -left-4 top-0 h-full w-1 bg-gradient-to-b from-primary via-secondary to-transparent opacity-50" />

            <HudFrame className="space-y-3">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h1 className="text-foreground">My Learning</h1>
                    <Sparkles className="h-5 w-5 text-secondary animate-pulse" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Track your progress, continue your courses, and stay consistent.
                  </p>

                  <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                    <span className="inline-flex items-center gap-2">
                      <Zap className="h-4 w-4 text-secondary" />
                      {loadingStats ? "—" : `${streak} Day Streak`}
                    </span>
                    <span className="inline-flex items-center gap-2">
                      <Target className="h-4 w-4 text-primary" />
                      {loadingStats ? "—" : `Level ${level}`}
                    </span>
                    <span className="inline-flex items-center gap-2">
                      <GraduationCap className="h-4 w-4 text-secondary" />
                      {loadingStats ? "—" : `${xp.toLocaleString()} XP`}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="secondary" className="rounded-xl" onClick={() => navigate("/app/catalog")}>
                    <BookOpen className="h-4 w-4" />
                    Browse Catalog
                  </Button>
                  <Button className="rounded-xl" onClick={() => setShowGoalModal(true)}>
                    <Target className="h-4 w-4" />
                    Set Goal
                  </Button>
                </div>
              </div>
            </HudFrame>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <section className="lg:col-span-2 space-y-4">
              <div className="flex items-center gap-3">
                <h2 className="text-foreground">Continue Learning</h2>
                <div className="h-px flex-1 bg-gradient-to-r from-primary/30 to-transparent" />
              </div>

              {loadingEnrollments ? (
                <div className="text-sm text-muted-foreground">Chargement...</div>
              ) : inProgress.length === 0 ? (
                <HudFrame className="p-6">
                  <p className="text-sm text-muted-foreground">
                    Aucun cours en cours.{" "}
                    <button
                      className="text-primary underline"
                      onClick={() => navigate("/app/catalog")}
                    >
                      Explore le catalogue
                    </button>{" "}
                    pour commencer.
                  </p>
                </HudFrame>
              ) : (
                <div className="grid gap-6 md:grid-cols-2">
                  {inProgress.map((e, idx) => (
                    <HudFrame key={e.courseId} className="relative p-6" hover>
                      <div className="absolute right-4 top-4 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs text-foreground">
                        {e.completedChapters}/{e.totalChapters} modules
                      </div>

                      <div
                        className={cn(
                          "relative mb-4 flex h-28 items-center justify-center overflow-hidden rounded-xl",
                          COURSE_GRADIENTS[idx % COURSE_GRADIENTS.length]
                        )}
                        style={{
                          boxShadow:
                            "0 0 10px rgba(108, 92, 231, 0.35), 0 0 18px rgba(76, 201, 240, 0.18)",
                        }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                        <div className="relative z-10 h-14 w-14 rotate-12 rounded-xl border-2 border-white/30 backdrop-blur-sm">
                          <div className="absolute inset-2 rounded-lg border border-white/20" />
                        </div>
                      </div>

                      <h3 className="text-foreground">{e.title}</h3>
                      {e.level && (
                        <p className="mt-1 text-xs text-muted-foreground">{e.level}</p>
                      )}

                      <div className="mt-4 space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Progress</span>
                          <span className="text-foreground">{e.progress}%</span>
                        </div>
                        <Progress value={e.progress} />
                      </div>

                      <Button
                        className="mt-4 w-full rounded-xl"
                        onClick={() => navigate(`/app/courses/${e.courseId}`)}
                      >
                        Continuer
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </HudFrame>
                  ))}
                </div>
              )}
            </section>

            <section className="space-y-4">
              <div className="flex items-center gap-3">
                <h2 className="text-foreground">This Week</h2>
                <div className="h-px flex-1 bg-gradient-to-r from-secondary/30 to-transparent" />
              </div>

              <HudFrame className="p-6" accent="blue">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-sm text-muted-foreground">Weekly learning goal</div>
                    <div className="mt-2 text-3xl text-foreground">
                      {weeklyMinutes}{" "}
                      <span className="text-muted-foreground text-base">/ {weeklyGoal} min</span>
                    </div>
                  </div>

                  <div
                    className="rounded-xl p-3"
                    style={{
                      background: "rgba(76,201,240,0.14)",
                      border: "1px solid rgba(255,255,255,0.06)",
                      boxShadow: "0 0 10px rgba(76,201,240,0.35), 0 0 18px rgba(76,201,240,0.18)",
                      backdropFilter: "blur(10px)",
                    }}
                  >
                    <Clock className="h-6 w-6 text-secondary" />
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Progress</span>
                    <span>{weeklyPct}%</span>
                  </div>
                  <Progress value={weeklyPct} />
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
                    <div className="text-xs text-muted-foreground">Streak</div>
                    <div className="mt-1 text-lg text-foreground">{streak} days</div>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
                    <div className="text-xs text-muted-foreground">Level</div>
                    <div className="mt-1 text-lg text-foreground">{level}</div>
                  </div>
                </div>
              </HudFrame>
            </section>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <h2 className="text-foreground">Enrolled Courses</h2>
              <div className="h-px flex-1 bg-gradient-to-r from-primary/30 to-transparent" />
            </div>

            {loadingEnrollments ? (
              <div className="text-sm text-muted-foreground">Chargement...</div>
            ) : allEnrolled.length === 0 ? (
              <HudFrame className="p-6">
                <p className="text-sm text-muted-foreground">
                  Tu n'es inscrit à aucun cours.{" "}
                  <button
                    className="text-primary underline"
                    onClick={() => navigate("/app/catalog")}
                  >
                    Explore le catalogue
                  </button>
                  .
                </p>
              </HudFrame>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {allEnrolled.map((e, idx) => (
                  <HudFrame key={e.courseId} className="p-6" hover>
                    <div
                      className={cn(
                        "relative mb-4 flex h-20 items-center justify-center overflow-hidden rounded-xl",
                        COURSE_GRADIENTS[idx % COURSE_GRADIENTS.length]
                      )}
                    >
                      <div className="absolute inset-0 bg-black/10" />
                      <div className="relative z-10 h-10 w-10 rotate-45 rounded-lg border-2 border-white/30 backdrop-blur-sm">
                        <div className="absolute inset-1.5 rounded-md border border-white/20" />
                      </div>
                    </div>

                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <h3 className="truncate text-foreground">{e.title}</h3>
                        <div className="mt-1 text-xs text-muted-foreground">
                          Inscrit le {new Date(e.enrolledAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}
                        </div>
                      </div>
                      {e.level && (
                        <span className="shrink-0 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[11px] text-foreground">
                          {e.level}
                        </span>
                      )}
                    </div>

                    <div className="mt-3 flex items-center gap-3 text-sm text-muted-foreground">
                      <span>{e.totalChapters} modules</span>
                      <span>•</span>
                      <span>{e.completedChapters} complétés</span>
                    </div>

                    <div className="mt-4 space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="text-foreground">{e.progress}%</span>
                      </div>
                      <Progress value={e.progress} />
                    </div>

                    <div className="mt-4 flex gap-2">
                      <Button
                        className="w-full rounded-xl"
                        onClick={() => navigate(`/app/courses/${e.courseId}`)}
                      >
                        Ouvrir
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </HudFrame>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {showGoalModal && (
        <GoalModal
          initialGoals={goals}
          onSave={saveGoals}
          onClose={() => setShowGoalModal(false)}
        />
      )}
    </>
  );
}
