import * as React from "react";
import { useNavigate } from "react-router-dom";
import {
  Camera,
  Mail,
  Calendar,
  Sparkles,
  Zap,
  Target,
  Award,
  Shield,
  LogOut,
  ArrowRight,
  Clock,
  Flame,
  Pencil,
} from "lucide-react";

import { Button } from "@/shared/ui/Button";
import { useAuthContext } from "@/context/AuthContext";
import { useCourses } from "@/hooks/useCourses";
import { useProgress } from "@/hooks/useProgress";
import { useGoals } from "@/hooks/useGoals";
import { GoalModal } from "@/pages/MyLearningPage/GoalModal";

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
}

type BadgeItem = {
  id: string;
  title: string;
  desc: string;
  icon: React.ComponentType<{ className?: string }>;
  glow: "purple" | "blue" | "pink";
};

type ActivityItem = {
  id: string;
  title: string;
  meta: string;
  tag: string;
};

export function ProfilePage() {
  const { user: authUser, logout } = useAuthContext();
  const navigate = useNavigate();
  const { data: courses = [] } = useCourses();
  const { data: progressRecords = [] } = useProgress();
  const { goals, saveGoals } = useGoals();
  const [showGoalModal, setShowGoalModal] = React.useState(false);

  const completedCount = progressRecords.filter((p) => p.status === "COMPLETED").length;
  const inProgressCount = progressRecords.filter((p) => p.status === "IN_PROGRESS").length;

  const stats = [
    { label: "Cours disponibles", value: String(courses.length), icon: Award, accent: "purple" as const },
    { label: "Chapitres terminés", value: String(completedCount), icon: Target, accent: "purple" as const },
    { label: "En cours", value: String(inProgressCount), icon: Zap, accent: "blue" as const },
  ];

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  const badges: BadgeItem[] = [
    {
      id: "b1",
      title: "Orbit Starter",
      desc: "Completed your first course",
      icon: Sparkles,
      glow: "purple",
    },
    {
      id: "b2",
      title: "Consistency",
      desc: "10+ day streak",
      icon: Zap,
      glow: "blue",
    },
    {
      id: "b3",
      title: "Mission Ready",
      desc: "Level 10 reached",
      icon: Shield,
      glow: "pink",
    },
  ];

  const recentActivity: ActivityItem[] = [
    {
      id: "a1",
      title: "Finished lesson: Understanding Polyhedrons",
      meta: "3D Geometry Fundamentals • 12 min",
      tag: "Completed",
    },
    {
      id: "a2",
      title: "Started module: Mental Rotation Exercises",
      meta: "Spatial Reasoning & Problem Solving • 20 min",
      tag: "In progress",
    },
    {
      id: "a3",
      title: "Unlocked badge: Consistency",
      meta: "Streak milestone • +250 XP",
      tag: "Unlocked",
    },
  ];


  return (
    <>
    <div className="relative p-8">
      <div className="pointer-events-none absolute inset-0 opacity-40 space-grid" />

      <div className="relative mx-auto max-w-7xl space-y-8">
        <div className="relative">
          <div className="absolute -left-4 top-0 h-full w-1 bg-gradient-to-b from-primary via-secondary to-transparent opacity-50" />
          <div
            className="space-y-3 rounded-2xl border p-6"
            style={{
              background: "rgba(26, 31, 51, 0.6)",
              backdropFilter: "blur(12px)",
              borderColor: "rgba(108, 92, 231, 0.2)",
              boxShadow:
                "0 4px 16px rgba(0,0,0,0.5), 0 0 25px rgba(108, 92, 231, 0.15), inset 0 1px 1px rgba(255,255,255,0.05)",
            }}
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-start gap-4">
                <div className="relative">
                  <div
                    className="h-16 w-16 rounded-2xl border"
                    style={{
                      background: "rgba(108, 92, 231, 0.12)",
                      borderColor: "rgba(108, 92, 231, 0.25)",
                      boxShadow: "0 0 10px rgba(108, 92, 231, 0.35), 0 0 22px rgba(108, 92, 231, 0.18)",
                      backdropFilter: "blur(8px)",
                    }}
                  />
                  <button
                    className="absolute -bottom-2 -right-2 inline-flex h-9 w-9 items-center justify-center rounded-xl border bg-black/20 backdrop-blur-md transition hover:bg-black/30"
                    style={{ borderColor: "rgba(76, 201, 240, 0.25)" }}
                    type="button"
                    aria-label="Change profile picture"
                  >
                    <Camera className="h-4 w-4 text-secondary" />
                  </button>
                </div>

                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="text-foreground">{authUser?.name ?? "Utilisateur"}</h1>
                    <span className="ml-2 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs text-foreground">
                      <Sparkles className="h-3.5 w-3.5 text-secondary" />
                      {completedCount} chapitres terminés
                    </span>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                    <span className="inline-flex items-center gap-2">
                      <Mail className="h-4 w-4 text-secondary" />
                      {authUser?.email}
                    </span>
                    {authUser?.createdAt && (
                      <span className="inline-flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-secondary" />
                        Inscrit en {formatDate(authUser.createdAt)}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex shrink-0 gap-2">
                <Button variant="ghost" className="rounded-xl" type="button" onClick={handleLogout}>
                  <LogOut className="h-4 w-4" />
                  Déconnexion
                </Button>
              </div>
            </div>

          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {stats.map((s) => {
            const Icon = s.icon;
            const isBlue = s.accent === "blue";
            return (
              <div
                key={s.label}
                className="relative overflow-hidden rounded-2xl border p-6 transition-all hover:-translate-y-1"
                style={{
                  background: "rgba(26, 31, 51, 0.6)",
                  backdropFilter: "blur(12px)",
                  borderColor: "rgba(108, 92, 231, 0.2)",
                  boxShadow: "0 4px 16px rgba(0,0,0,0.5), 0 0 25px rgba(108, 92, 231, 0.15)",
                }}
              >
                <div className="absolute left-0 top-0 h-[1px] w-full bg-gradient-to-r from-transparent via-primary to-transparent opacity-30" />
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-sm text-muted-foreground">{s.label}</div>
                    <div className="mt-2 text-4xl text-foreground">{s.value}</div>
                  </div>
                  <div
                    className={cx(
                      "rounded-xl p-3",
                      isBlue ? "bg-secondary/20" : "bg-primary/20"
                    )}
                    style={{
                      border: "1px solid rgba(255,255,255,0.06)",
                      boxShadow: isBlue
                        ? "0 0 10px rgba(76,201,240,0.35), 0 0 22px rgba(76,201,240,0.18)"
                        : "0 0 10px rgba(108,92,231,0.35), 0 0 22px rgba(108,92,231,0.18)",
                      backdropFilter: "blur(10px)",
                    }}
                  >
                    <Icon className={cx("h-6 w-6", isBlue ? "text-secondary" : "text-primary")} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Objectifs ── */}
        <section
          className="rounded-2xl border p-6"
          style={{
            background: "rgba(26, 31, 51, 0.6)",
            backdropFilter: "blur(12px)",
            borderColor: "rgba(108, 92, 231, 0.2)",
            boxShadow: "0 4px 16px rgba(0,0,0,0.5), 0 0 25px rgba(108, 92, 231, 0.15)",
          }}
        >
          <div className="mb-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h2 className="text-foreground">Mes objectifs</h2>
              <div className="h-[1px] w-24 bg-gradient-to-r from-violet-500/40 to-transparent" />
            </div>
            <button
              type="button"
              onClick={() => setShowGoalModal(true)}
              className="flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-xs text-muted-foreground transition hover:border-violet-500/30 hover:bg-violet-500/10 hover:text-violet-300"
            >
              <Pencil className="size-3" />
              Modifier
            </button>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {/* Daily */}
            <div
              className="flex items-center gap-4 rounded-2xl p-4"
              style={{ background: "rgba(139,92,246,0.08)", border: "1px solid rgba(139,92,246,0.2)", boxShadow: "0 0 20px rgba(139,92,246,0.08)" }}
            >
              <div
                className="flex size-10 shrink-0 items-center justify-center rounded-xl"
                style={{ background: "rgba(139,92,246,0.15)", boxShadow: "0 0 12px rgba(139,92,246,0.4)" }}
              >
                <Clock className="size-5 text-violet-400" />
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Quotidien</div>
                <div className="text-xl font-bold text-violet-300">{goals.daily} <span className="text-xs font-normal text-muted-foreground">min</span></div>
              </div>
            </div>

            {/* Weekly */}
            <div
              className="flex items-center gap-4 rounded-2xl p-4"
              style={{ background: "rgba(34,211,238,0.08)", border: "1px solid rgba(34,211,238,0.2)", boxShadow: "0 0 20px rgba(34,211,238,0.08)" }}
            >
              <div
                className="flex size-10 shrink-0 items-center justify-center rounded-xl"
                style={{ background: "rgba(34,211,238,0.15)", boxShadow: "0 0 12px rgba(34,211,238,0.4)" }}
              >
                <Target className="size-5 text-cyan-400" />
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Par semaine</div>
                <div className="text-xl font-bold text-cyan-300">{goals.weekly} <span className="text-xs font-normal text-muted-foreground">capsules</span></div>
              </div>
            </div>

            {/* Streak */}
            <div
              className="flex items-center gap-4 rounded-2xl p-4"
              style={{ background: "rgba(251,146,60,0.08)", border: "1px solid rgba(251,146,60,0.2)", boxShadow: "0 0 20px rgba(251,146,60,0.08)" }}
            >
              <div
                className="flex size-10 shrink-0 items-center justify-center rounded-xl"
                style={{ background: "rgba(251,146,60,0.15)", boxShadow: "0 0 12px rgba(251,146,60,0.4)" }}
              >
                <Flame className="size-5 text-orange-400" />
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Streak cible</div>
                <div className="text-xl font-bold text-orange-300">{goals.streak} <span className="text-xs font-normal text-muted-foreground">jours</span></div>
              </div>
            </div>
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-3">
          <section
            className="lg:col-span-1 rounded-2xl border p-6"
            style={{
              background: "rgba(26, 31, 51, 0.6)",
              backdropFilter: "blur(12px)",
              borderColor: "rgba(108, 92, 231, 0.2)",
              boxShadow: "0 4px 16px rgba(0,0,0,0.5), 0 0 25px rgba(108, 92, 231, 0.15)",
            }}
          >
            <div className="mb-4 flex items-center gap-3">
              <h2 className="text-foreground">Badges</h2>
              <div className="h-[1px] flex-1 bg-gradient-to-r from-primary/30 to-transparent" />
            </div>

            <div className="space-y-3">
              {badges.map((b) => {
                const Icon = b.icon;
                const glow =
                  b.glow === "blue"
                    ? "0 0 10px rgba(76,201,240,0.35), 0 0 22px rgba(76,201,240,0.18)"
                    : b.glow === "pink"
                      ? "0 0 10px rgba(255,107,157,0.30), 0 0 18px rgba(255,107,157,0.14)"
                      : "0 0 10px rgba(108,92,231,0.35), 0 0 22px rgba(108,92,231,0.18)";

                const accentClass =
                  b.glow === "blue" ? "text-secondary" : b.glow === "pink" ? "text-destructive" : "text-primary";

                return (
                  <div
                    key={b.id}
                    className="flex items-start gap-3 rounded-2xl border p-4"
                    style={{
                      background: "rgba(13, 15, 26, 0.35)",
                      borderColor: "rgba(255,255,255,0.06)",
                      backdropFilter: "blur(10px)",
                      boxShadow: "inset 0 1px 1px rgba(255,255,255,0.04)",
                    }}
                  >
                    <div
                      className="rounded-xl p-2"
                      style={{
                        background: "rgba(255,255,255,0.03)",
                        border: "1px solid rgba(255,255,255,0.06)",
                        boxShadow: glow,
                      }}
                    >
                      <Icon className={cx("h-5 w-5", accentClass)} />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <div className="truncate text-sm font-medium text-foreground">{b.title}</div>
                        <span className="shrink-0 rounded-full border border-primary/20 bg-primary/10 px-2 py-0.5 text-[11px] text-foreground">
                          Earned
                        </span>
                      </div>
                      <div className="mt-1 text-xs leading-5 text-muted-foreground">{b.desc}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <section
            className="lg:col-span-2 rounded-2xl border p-6"
            style={{
              background: "rgba(26, 31, 51, 0.6)",
              backdropFilter: "blur(12px)",
              borderColor: "rgba(108, 92, 231, 0.2)",
              boxShadow: "0 4px 16px rgba(0,0,0,0.5), 0 0 25px rgba(108, 92, 231, 0.15)",
            }}
          >
            <div className="mb-4 flex items-center gap-3">
              <h2 className="text-foreground">Recent activity</h2>
              <div className="h-[1px] flex-1 bg-gradient-to-r from-secondary/30 to-transparent" />
            </div>

            <div className="space-y-3">
              {recentActivity.map((a) => (
                <div
                  key={a.id}
                  className="group flex items-start justify-between gap-4 rounded-2xl border p-4 transition hover:-translate-y-[1px]"
                  style={{
                    background: "rgba(13, 15, 26, 0.35)",
                    borderColor: "rgba(255,255,255,0.06)",
                    backdropFilter: "blur(10px)",
                  }}
                >
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium text-foreground">{a.title}</div>
                    <div className="mt-1 text-xs text-muted-foreground">{a.meta}</div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="rounded-full border border-secondary/20 bg-secondary/10 px-3 py-1 text-[11px] text-foreground">
                      {a.tag}
                    </span>
                    <button
                      type="button"
                      className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.02] text-foreground transition hover:bg-white/[0.05]"
                      aria-label="Open"
                    >
                      <ArrowRight className="h-4 w-4 opacity-70 transition group-hover:opacity-100" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex justify-end">
              <Button variant="secondary" className="rounded-xl" type="button">
                View all activity
              </Button>
            </div>
          </section>
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