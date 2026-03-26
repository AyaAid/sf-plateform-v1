import * as React from "react";
import {
  Camera,
  Mail,
  MapPin,
  Calendar,
  Sparkles,
  Zap,
  Target,
  Award,
  Shield,
  Edit3,
  LogOut,
  ArrowRight,
} from "lucide-react";

import { Button } from "@/shared/ui/Button";

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
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
  const user = {
    name: "Tom Cruise",
    handle: "@boss",
    email: "tommy@lastar.io",
    location: "Île-de-France, FR",
    joined: "Joined Jan 2026",
    bio: "Yes, I am Tom Cruise and I love Aya",
    level: 12,
    streakDays: 14,
    xp: 18420,
    nextLevelXp: 20000,
  };

  const stats = [
    { label: "Courses Enrolled", value: "8", icon: Award, accent: "purple" as const },
    { label: "Hours Learned", value: "47", icon: Zap, accent: "blue" as const },
    { label: "Skills Mastered", value: "12", icon: Target, accent: "purple" as const },
  ];

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

  const progressPct = Math.min(100, Math.round((user.xp / user.nextLevelXp) * 100));

  return (
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
                    <h1 className="text-foreground">{user.name}</h1>
                    <span className="text-sm text-muted-foreground">{user.handle}</span>
                    <span className="ml-2 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs text-foreground">
                      <Sparkles className="h-3.5 w-3.5 text-secondary" />
                      Level {user.level}
                    </span>
                  </div>

                  <p className="max-w-2xl text-sm leading-6 text-muted-foreground">{user.bio}</p>

                  <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                    <span className="inline-flex items-center gap-2">
                      <Mail className="h-4 w-4 text-secondary" />
                      {user.email}
                    </span>
                    <span className="inline-flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-primary" />
                      {user.location}
                    </span>
                    <span className="inline-flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-secondary" />
                      {user.joined}
                    </span>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                    <span className="inline-flex items-center gap-2">
                      <Zap className="h-4 w-4 text-secondary" />
                      {user.streakDays} Day Streak
                    </span>
                    <span className="inline-flex items-center gap-2">
                      <Target className="h-4 w-4 text-primary" />
                      {user.xp.toLocaleString()} XP
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex shrink-0 gap-2">
                <Button variant="secondary" className="rounded-xl" type="button">
                  <Edit3 className="h-4 w-4" />
                  Edit Profile
                </Button>
                <Button variant="ghost" className="rounded-xl" type="button">
                  <LogOut className="h-4 w-4" />
                  Sign out
                </Button>
              </div>
            </div>

            <div className="mt-2">
              <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
                <span>Next level</span>
                <span>
                  {user.xp.toLocaleString()} / {user.nextLevelXp.toLocaleString()} XP ({progressPct}%)
                </span>
              </div>
              <div
                className="h-2 w-full rounded-full border"
                style={{
                  background: "rgba(108, 92, 231, 0.08)",
                  borderColor: "rgba(108, 92, 231, 0.18)",
                  boxShadow: "inset 0 2px 8px rgba(0,0,0,0.35)",
                }}
              >
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${progressPct}%`,
                    background: "linear-gradient(90deg, rgba(108,92,231,0.95), rgba(76,201,240,0.85))",
                    boxShadow: "0 0 10px rgba(108, 92, 231, 0.35), 0 0 18px rgba(76, 201, 240, 0.2)",
                  }}
                />
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
  );
}