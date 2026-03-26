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

type ContinueItem = {
  id: string;
  title: string;
  nextLesson: string;
  timeLeft: string;
  progress: number;
  thumbnailClass: string;
};

type CourseItem = {
  id: string;
  title: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  duration: string;
  lessons: number;
  progress: number;
  enrolledDate: string;
  gradientClass: string;
};

type ActivityItem = {
  id: string;
  title: string;
  meta: string;
  tag: "Completed" | "In progress" | "Unlocked";
};

export function MyLearningPage() {
    const navigate = useNavigate();
  const continueLearning: ContinueItem[] = [
    {
      id: "1",
      title: "3D Geometry Fundamentals",
      nextLesson: "Understanding Polyhedrons",
      timeLeft: "12 min left",
      progress: 65,
      thumbnailClass: "bg-gradient-to-br from-primary to-secondary",
    },
    {
      id: "2",
      title: "Spatial Reasoning & Problem Solving",
      nextLesson: "Mental Rotation Exercises",
      timeLeft: "20 min left",
      progress: 40,
      thumbnailClass: "bg-gradient-to-br from-secondary to-primary",
    },
  ];

  const courses: CourseItem[] = [
    {
      id: "c1",
      title: "Vector Mathematics",
      level: "Intermediate",
      duration: "7 weeks",
      lessons: 24,
      progress: 18,
      enrolledDate: "Enrolled Jan 2026",
      gradientClass: "from-green-500 to-emerald-600",
    },
    {
      id: "c2",
      title: "CAD & 3D Modeling Basics",
      level: "Beginner",
      duration: "8 weeks",
      lessons: 32,
      progress: 72,
      enrolledDate: "Enrolled Jan 2026",
      gradientClass: "from-pink-500 to-purple-600",
    },
    {
      id: "c3",
      title: "Topological Thinking",
      level: "Advanced",
      duration: "10 weeks",
      lessons: 18,
      progress: 5,
      enrolledDate: "Enrolled Jan 2026",
      gradientClass: "from-orange-500 to-red-600",
    },
    {
      id: "c4",
      title: "Coordinate Systems & Projections",
      level: "Beginner",
      duration: "5 weeks",
      lessons: 20,
      progress: 55,
      enrolledDate: "Enrolled Jan 2026",
      gradientClass: "from-amber-500 to-yellow-600",
    },
    {
      id: "c5",
      title: "Spatial Data Visualization",
      level: "Advanced",
      duration: "9 weeks",
      lessons: 26,
      progress: 28,
      enrolledDate: "Enrolled Jan 2026",
      gradientClass: "from-cyan-500 to-sky-600",
    },
    {
      id: "c6",
      title: "Architectural Spatial Design",
      level: "Intermediate",
      duration: "12 weeks",
      lessons: 36,
      progress: 12,
      enrolledDate: "Enrolled Jan 2026",
      gradientClass: "from-indigo-500 to-violet-600",
    },
  ];

  const activity: ActivityItem[] = [
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
      title: "Unlocked streak milestone",
      meta: "Consistency • +250 XP",
      tag: "Unlocked",
    },
  ];

  const stats = {
    streakDays: 14,
    level: 12,
    xp: 18420,
    weeklyGoal: 300,
    learnedThisWeek: 145,
  };

  const weeklyPct = Math.min(100, Math.round((stats.learnedThisWeek / stats.weeklyGoal) * 100));

  return (
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
                    {stats.streakDays} Day Streak
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <Target className="h-4 w-4 text-primary" />
                    Level {stats.level}
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <GraduationCap className="h-4 w-4 text-secondary" />
                    {stats.xp.toLocaleString()} XP
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="secondary" className="rounded-xl">
                  <BookOpen className="h-4 w-4" />
                  Browse Catalog
                </Button>
                <Button className="rounded-xl">
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

            <div className="grid gap-6 md:grid-cols-2">
              {continueLearning.map((c) => (
                <HudFrame key={c.id} className="relative p-6" hover>
                  <div className="absolute right-4 top-4 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs text-foreground">
                    {c.timeLeft}
                  </div>

                  <div
                    className={cn(
                      "relative mb-4 flex h-28 items-center justify-center overflow-hidden rounded-xl",
                      c.thumbnailClass
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

                  <h3 className="text-foreground">{c.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Next: <span className="text-foreground/90">{c.nextLesson}</span>
                  </p>

                  <div className="mt-4 space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="text-foreground">{c.progress}%</span>
                    </div>
                    <Progress value={c.progress} />
                  </div>

                  <Button className="mt-4 w-full rounded-xl" onClick={() => navigate(`/app/courses/${c.id}`)}>
                    Continue
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </HudFrame>
              ))}
            </div>
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
                    {stats.learnedThisWeek} <span className="text-muted-foreground text-base">/ {stats.weeklyGoal} min</span>
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
                  <div className="mt-1 text-lg text-foreground">{stats.streakDays} days</div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
                  <div className="text-xs text-muted-foreground">Level</div>
                  <div className="mt-1 text-lg text-foreground">{stats.level}</div>
                </div>
              </div>
            </HudFrame>

            <HudFrame className="p-6">
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium text-foreground">Next actions</div>
                <span className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[11px] text-foreground">
                  Suggested
                </span>
              </div>

              <div className="mt-4 space-y-3">
                {[
                  { title: "Finish 1 lesson today", meta: "Keep the streak alive • ~12 min" },
                  { title: "Resume CAD module", meta: "You’re at 72% • aim 80%" },
                  { title: "Start 1 advanced course", meta: "Topological Thinking • unlock badge" },
                ].map((it) => (
                  <div
                    key={it.title}
                    className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"
                  >
                    <div className="text-sm text-foreground">{it.title}</div>
                    <div className="mt-1 text-xs text-muted-foreground">{it.meta}</div>
                  </div>
                ))}
              </div>
            </HudFrame>
          </section>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <h2 className="text-foreground">Enrolled Courses</h2>
            <div className="h-px flex-1 bg-gradient-to-r from-primary/30 to-transparent" />
          </div>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {courses.map((c) => (
              <HudFrame key={c.id} className="p-6" hover>
                <div
                  className={cn(
                    "relative mb-4 flex h-20 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br",
                    c.gradientClass
                  )}
                >
                  <div className="absolute inset-0 bg-black/10" />
                  <div className="relative z-10 h-10 w-10 rotate-45 rounded-lg border-2 border-white/30 backdrop-blur-sm">
                    <div className="absolute inset-1.5 rounded-md border border-white/20" />
                  </div>
                </div>

                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h3 className="truncate text-foreground">{c.title}</h3>
                    <div className="mt-1 text-xs text-muted-foreground">{c.enrolledDate}</div>
                  </div>

                  <span className="shrink-0 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[11px] text-foreground">
                    {c.level}
                  </span>
                </div>

                <div className="mt-3 flex items-center gap-3 text-sm text-muted-foreground">
                  <span className="inline-flex items-center gap-2">
                    <Clock className="h-4 w-4 text-secondary" />
                    {c.duration}
                  </span>
                  <span>•</span>
                  <span>{c.lessons} lessons</span>
                </div>

                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="text-foreground">{c.progress}%</span>
                  </div>
                  <Progress value={c.progress} />
                </div>

                <div className="mt-4 flex gap-2">
                  <Button className="w-full rounded-xl">
                    Open
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </HudFrame>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <h2 className="text-foreground">Recent activity</h2>
            <div className="h-px flex-1 bg-gradient-to-r from-secondary/30 to-transparent" />
          </div>

          <HudFrame className="p-6">
            <div className="space-y-3">
              {activity.map((a) => (
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
                    <span
                      className={cn(
                        "rounded-full border px-3 py-1 text-[11px] text-foreground",
                        a.tag === "Completed" && "border-secondary/20 bg-secondary/10",
                        a.tag === "In progress" && "border-primary/20 bg-primary/10",
                        a.tag === "Unlocked" && "border-white/10 bg-white/[0.03]"
                      )}
                    >
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
          </HudFrame>
        </div>
      </div>
    </div>
  );
}