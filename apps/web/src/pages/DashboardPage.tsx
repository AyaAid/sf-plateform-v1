import { ArrowRight, Award, Clock, Sparkles, Target, TrendingUp, Zap } from "lucide-react";
import { Button } from "@/shared/ui/Button";
import { Card, CardContent } from "@/shared/ui/Card";
import { Progress } from "@/shared/ui/Progress";
import { cn } from "@/shared/cn";
import { HudFrame } from "@/shared/ui/HudFrame";
import { useNavigate } from "react-router-dom";

type ContinueCourse = {
  id: string;
  title: string;
  progress: number;
  nextLesson: string;
  timeLeft: string;
  thumbnailClass: string; 
};

type Stat = {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  gradientClass: string;
};



export function DashboardPage() {
    const navigate = useNavigate();
  const continueLearning: ContinueCourse[] = [
    {
      id: "1",
      title: "3D Geometry Fundamentals",
      progress: 65,
      nextLesson: "Understanding Polyhedrons",
      timeLeft: "12 min left",
      thumbnailClass: "bg-gradient-to-br from-primary to-secondary",
    },
    {
      id: "2",
      title: "Spatial Reasoning & Problem Solving",
      progress: 40,
      nextLesson: "Mental Rotation Exercises",
      timeLeft: "20 min left",
      thumbnailClass: "bg-gradient-to-br from-secondary to-primary",
    },
  ];

  const stats: Stat[] = [
    { label: "Courses Enrolled", value: "8", icon: Award, gradientClass: "from-primary to-purple-500" },
    { label: "Hours Learned", value: "47", icon: Clock, gradientClass: "from-secondary to-cyan-500" },
    { label: "Skills Mastered", value: "12", icon: TrendingUp, gradientClass: "from-purple-500 to-pink-500" },
  ];

  const recommended = [
    { title: "Vector Mathematics", level: "Intermediate", lessons: "24 lessons", gradientClass: "from-green-500 to-emerald-600" },
    { title: "Topological Thinking", level: "Advanced", lessons: "18 lessons", gradientClass: "from-orange-500 to-red-600" },
    { title: "CAD & 3D Modeling Basics", level: "Beginner", lessons: "32 lessons", gradientClass: "from-pink-500 to-purple-600" },
  ];

  return (
    <div className="p-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="relative">
          <div className="absolute -left-4 top-0 h-full w-1 bg-gradient-to-b from-primary via-secondary to-transparent opacity-50" />

          <HudFrame className="space-y-2">
  <div className="flex items-center gap-2">
    <h1 className="text-foreground">Welcome back, Tom!</h1>
    <Sparkles className="h-5 w-5 animate-pulse text-secondary" />
  </div>

  <p className="text-muted-foreground">
    Continue your spatial learning journey
  </p>

  <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
    <span className="inline-flex items-center gap-2">
      <Zap className="h-4 w-4 text-secondary" />
      14 Day Streak
    </span>
    <span className="inline-flex items-center gap-2">
      <Target className="h-4 w-4 text-primary" />
      Level 12
    </span>
  </div>
</HudFrame>
        </div>

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
      className={cn(
        "rounded-xl p-3",
        s.gradientClass
      )}
      style={{
        background: "rgba(108,92,231,0.18)",
        border: "1px solid rgba(255,255,255,0.06)",
        boxShadow: "0 0 10px rgba(108,92,231,0.35)",
        backdropFilter: "blur(10px)",
      }}
    >
      <Icon className="h-6 w-6 text-primary" />
    </div>
  </div>
</HudFrame>
            );
          })}
        </div>

        <div>
          <div className="mb-4 flex items-center gap-3">
            <h2 className="text-foreground">Continue Learning</h2>
            <div className="h-px flex-1 bg-gradient-to-r from-primary/30 to-transparent" />
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {continueLearning.map((course) => (
              <HudFrame>
  <div className="absolute right-4 top-4 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs text-foreground">
    {course.timeLeft}
  </div>

  <div
    className={cn(
      "relative mb-4 flex h-32 items-center justify-center overflow-hidden rounded-xl",
      course.thumbnailClass
    )}
    style={{ boxShadow: "var(--glow-purple-sm)" }}
  >
    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
    <div className="relative z-10 h-16 w-16 rotate-12 rounded-xl border-2 border-white/30 backdrop-blur-sm">
      <div className="absolute inset-2 rounded-lg border border-white/20" />
    </div>
  </div>

  <h3 className="mb-2 text-foreground">{course.title}</h3>
  <p className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
    <span className="h-1 w-1 rounded-full bg-secondary" />
    Next: {course.nextLesson}
  </p>

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
            ))}
          </div>
        </div>

        <div>
          <div className="mb-4 flex items-center gap-3">
            <h2 className="text-foreground">Recommended for You</h2>
            <div className="h-px flex-1 bg-gradient-to-r from-secondary/30 to-transparent" />
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {recommended.map((c) => (
              <Card key={c.title} className="space-card space-card-hover overflow-hidden">
                <CardContent className="p-6">
                  <div className={cn("relative mb-4 flex h-24 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br", c.gradientClass)}>
                    <div className="absolute inset-0 bg-black/10" />
                    <div className="relative z-10 h-12 w-12 rotate-45 rounded-lg border-2 border-white/30 backdrop-blur-sm">
                      <div className="absolute inset-1.5 rounded-md border border-white/20" />
                    </div>
                  </div>

                  <h3 className="mb-2 text-foreground">{c.title}</h3>

                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <span className="rounded-md border border-primary/20 bg-primary/10 px-2 py-1 text-xs text-primary">
                      {c.level}
                    </span>
                    <span>•</span>
                    <span>{c.lessons}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="pointer-events-none fixed inset-0 -z-10 opacity-30 space-grid" />
      </div>
    </div>
  );
}