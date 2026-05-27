import { ArrowRight, Award, BookOpen, Clock, Sparkles, Target, TrendingUp, Zap } from "lucide-react";
import { Button } from "@/shared/ui/Button";
import { Progress } from "@/shared/ui/Progress";
import { cn } from "@/shared/cn";
import { HudFrame } from "@/shared/ui/HudFrame";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "@/context/AuthContext";
import { useCourses } from "@/hooks/useCourses";
import { useProgress } from "@/hooks/useProgress";

const COURSE_PALETTE = [
  { from: "rgba(108,92,231,0.9)",  to: "rgba(79,70,229,0.9)"  },
  { from: "rgba(16,185,129,0.9)",  to: "rgba(13,148,136,0.9)" },
  { from: "rgba(236,72,153,0.9)",  to: "rgba(225,29,72,0.9)"  },
  { from: "rgba(249,115,22,0.9)",  to: "rgba(245,158,11,0.9)" },
  { from: "rgba(6,182,212,0.9)",   to: "rgba(14,165,233,0.9)" },
  { from: "rgba(217,70,239,0.9)",  to: "rgba(168,85,247,0.9)" },
];

export function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const { data: courses = [] } = useCourses();
  const { data: progressRecords = [] } = useProgress();

  // Calcul du % de progression par cours :
  // On compte les chapitres COMPLETED parmi tous les chapitres du cours
  const coursesWithProgress = courses.map((course) => {
    const allChapterIds = course._count.capsules; // nombre de capsules (approximation)
    const completedCount = progressRecords.filter(
      (p) => p.status === "COMPLETED"
    ).length;
    const progress = allChapterIds > 0
      ? Math.round((completedCount / allChapterIds) * 100)
      : 0;
    return { ...course, progress };
  });

  // On n'affiche que les cours ayant au moins 1 chapitre en progression
  const inProgress = coursesWithProgress.filter((c) => c.progress > 0 && c.progress < 100);

  const stats = [
    {
      label: "Cours disponibles",
      value: String(courses.length),
      icon: Award,
      iconBg: "rgba(139,92,246,0.2)",
      iconGlow: "0 0 14px rgba(139,92,246,0.5), 0 0 28px rgba(139,92,246,0.2)",
      iconColor: "text-violet-400",
    },
    {
      label: "Chapitres terminés",
      value: String(progressRecords.filter((p) => p.status === "COMPLETED").length),
      icon: TrendingUp,
      iconBg: "rgba(16,185,129,0.2)",
      iconGlow: "0 0 14px rgba(16,185,129,0.5), 0 0 28px rgba(16,185,129,0.2)",
      iconColor: "text-emerald-400",
    },
    {
      label: "En cours",
      value: String(progressRecords.filter((p) => p.status === "IN_PROGRESS").length),
      icon: Clock,
      iconBg: "rgba(6,182,212,0.2)",
      iconGlow: "0 0 14px rgba(6,182,212,0.5), 0 0 28px rgba(6,182,212,0.2)",
      iconColor: "text-cyan-400",
    },
  ];

  return (
    <div className="p-8">
      <div className="mx-auto max-w-7xl space-y-8">

        {/* Header */}
        <div className="relative">
          <div className="absolute -left-4 top-0 h-full w-1 bg-gradient-to-b from-primary via-secondary to-transparent opacity-50" />
          <HudFrame className="space-y-2">
            <div className="flex items-center gap-2">
              <h1 className="text-foreground">
                Welcome back{user?.name ? `, ${user.name}` : ""}!
              </h1>
              <Sparkles className="h-5 w-5 animate-pulse text-secondary" />
            </div>
            <p className="text-muted-foreground">
              Continue your spatial learning journey
            </p>
            <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-2">
                <Zap className="h-4 w-4 text-secondary" />
                {progressRecords.length} activité{progressRecords.length !== 1 ? "s" : ""}
              </span>
              <span className="inline-flex items-center gap-2">
                <Target className="h-4 w-4 text-primary" />
                {courses.length} cours
              </span>
            </div>
          </HudFrame>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {stats.map((s) => {
            const Icon = s.icon;
            return (
              <HudFrame key={s.label}>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-sm text-muted-foreground">{s.label}</div>
                    <div className="mt-2 text-4xl text-foreground">{s.value}</div>
                  </div>
                  <div
                    className="rounded-xl p-3"
                    style={{
                      background: s.iconBg,
                      border: "1px solid rgba(255,255,255,0.08)",
                      boxShadow: s.iconGlow,
                      backdropFilter: "blur(10px)",
                    }}
                  >
                    <Icon className={cn("h-6 w-6", s.iconColor)} />
                  </div>
                </div>
              </HudFrame>
            );
          })}
        </div>

        {/* Continue Learning */}
        <div>
          <div className="mb-4 flex items-center gap-3">
            <h2 className="text-foreground">Continue Learning</h2>
            <div className="h-px flex-1 bg-gradient-to-r from-primary/30 to-transparent" />
          </div>

          {inProgress.length === 0 ? (
            <HudFrame className="p-6 text-center">
              <BookOpen className="mx-auto mb-2 h-8 w-8 text-white/30" />
              <p className="text-sm text-muted-foreground">
                Aucun cours en cours. Explore le catalogue !
              </p>
              <Button className="mt-4 rounded-xl" onClick={() => navigate("/app/catalog")}>
                Voir le catalogue
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </HudFrame>
          ) : (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {inProgress.map((course, idx) => {
                const palette = COURSE_PALETTE[idx % COURSE_PALETTE.length];
                return (
                <HudFrame key={course.id}>
                  <div
                    className="relative mb-4 flex h-32 items-center justify-center overflow-hidden rounded-xl"
                    style={{ background: `linear-gradient(135deg, ${palette.from}, ${palette.to})` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                    <div className="relative z-10 h-16 w-16 rotate-12 rounded-xl border-2 border-white/30 backdrop-blur-sm">
                      <div className="absolute inset-2 rounded-lg border border-white/20" />
                    </div>
                  </div>

                  <h3 className="mb-4 text-foreground">{course.title}</h3>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="text-foreground">{course.progress}%</span>
                    </div>
                    <Progress value={course.progress} />
                  </div>

                  <Button
                    className="mt-4 w-full rounded-xl"
                    onClick={() => navigate(`/app/courses/${course.id}`)}
                  >
                    Continue Learning
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </HudFrame>
                );
              })}
            </div>
          )}
        </div>

        <div className="pointer-events-none fixed inset-0 -z-10 opacity-30 space-grid" />
      </div>
    </div>
  );
}
