import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowRight, BookOpen, Clock, GraduationCap, Sparkles } from "lucide-react";

import { HudFrame } from "@/shared/ui/HudFrame";
import { Button } from "@/shared/ui/Button";
import { Progress } from "@/shared/ui/Progress";
import { cn } from "@/shared/cn";

type Chapter = {
  id: string;
  title: string;
  duration: string;
  status: "locked" | "available" | "completed";
};

type Course = {
  id: string;
  title: string;
  description: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  progress: number;
  gradientClass: string;
  chapters: Chapter[];
};

const mockCourses: Course[] = [
  {
    id: "1",
    title: "3D Geometry Fundamentals",
    description: "Master the basics of 3D shapes, surfaces, and spatial relationships.",
    level: "Beginner",
    progress: 65,
    gradientClass: "from-primary to-secondary",
    chapters: [
      { id: "ch1", title: "Introduction to 3D space", duration: "8 min", status: "completed" },
      { id: "ch2", title: "Understanding Polyhedrons", duration: "12 min", status: "available" },
      { id: "ch3", title: "Spatial transformations", duration: "14 min", status: "locked" },
    ],
  },
  {
    id: "2",
    title: "Spatial Reasoning & Problem Solving",
    description: "Develop advanced spatial reasoning skills through interactive challenges.",
    level: "Intermediate",
    progress: 40,
    gradientClass: "from-secondary to-primary",
    chapters: [
      { id: "ch1", title: "Mental rotation basics", duration: "10 min", status: "completed" },
      { id: "ch2", title: "Mental Rotation Exercises", duration: "20 min", status: "available" },
      { id: "ch3", title: "Spatial puzzles", duration: "16 min", status: "locked" },
    ],
  },
];

export function CoursePage() {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const course = useMemo(() => {
    return mockCourses.find((c) => c.id === courseId) ?? null;
  }, [courseId]);

  if (!course) {
    return (
      <div className="relative p-8">
        <div className="pointer-events-none absolute inset-0 opacity-40 space-grid" />
        <div className="relative mx-auto max-w-4xl">
          <HudFrame className="p-6">
            <h1 className="text-foreground">Course not found</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              This course doesn’t exist (yet). Check your route or mock data.
            </p>
            <div className="mt-4">
              <Button variant="secondary" className="rounded-xl" onClick={() => navigate("/app")}>
                Back to dashboard
              </Button>
            </div>
          </HudFrame>
        </div>
      </div>
    );
  }

  const nextChapter =
    course.chapters.find((ch) => ch.status === "available") ??
    course.chapters.find((ch) => ch.status === "completed") ??
    course.chapters[0];

  return (
    <div className="relative p-8">
      <div className="pointer-events-none absolute inset-0 opacity-40 space-grid" />

      <div className="relative mx-auto max-w-7xl space-y-8">
        <div className="relative">
          <div className="absolute -left-4 top-0 h-full w-1 bg-gradient-to-b from-primary via-secondary to-transparent opacity-50" />
          <HudFrame className="p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-foreground">{course.title}</h1>
                  <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs text-foreground">
                    <Sparkles className="h-3.5 w-3.5 text-secondary" />
                    {course.level}
                  </span>
                </div>
                <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
                  {course.description}
                </p>

                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Course progress</span>
                    <span className="text-foreground">{course.progress}%</span>
                  </div>
                  <Progress value={course.progress} />
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  className="rounded-xl"
                  onClick={() => navigate(`/app/courses/${course.id}/chapters/${nextChapter.id}`)}
                >
                  Resume
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button variant="secondary" className="rounded-xl" onClick={() => navigate("/app/catalog")}>
                  <BookOpen className="h-4 w-4" />
                  Catalog
                </Button>
              </div>
            </div>
          </HudFrame>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <h2 className="text-foreground">Chapters</h2>
            <div className="h-px flex-1 bg-gradient-to-r from-primary/30 to-transparent" />
          </div>

          <div className="grid gap-4">
            {course.chapters.map((ch) => {
              const isLocked = ch.status === "locked";
              const isCompleted = ch.status === "completed";

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
                            isCompleted && "border-secondary/20 bg-secondary/10",
                            !isCompleted && !isLocked && "border-primary/20 bg-primary/10",
                            isLocked && "border-white/10 bg-white/[0.03]"
                          )}
                        >
                          {isCompleted ? "Completed" : isLocked ? "Locked" : "Available"}
                        </span>
                      </div>
                      <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="h-4 w-4 text-primary" />
                        {ch.duration}
                      </div>
                    </div>

                    <Button
                      className="rounded-xl"
                      variant={isLocked ? "ghost" : "secondary"}
                      disabled={isLocked}
                      onClick={() => navigate(`/app/courses/${course.id}/chapters/${ch.id}`)}
                    >
                      {isLocked ? "Locked" : "Open"}
                      {!isLocked && <ArrowRight className="ml-2 h-4 w-4" />}
                    </Button>
                  </div>
                </HudFrame>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}