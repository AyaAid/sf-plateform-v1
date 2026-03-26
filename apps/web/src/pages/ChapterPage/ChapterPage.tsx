import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, BookOpen, Clock } from "lucide-react";

import { HudFrame } from "@/shared/ui/HudFrame";
import { Button } from "@/shared/ui/Button";

type ChapterContent = {
  id: string;
  title: string;
  duration: string;
  content: Array<
    | { type: "text"; value: string }
    | { type: "tip"; value: string }
    | { type: "checkpoint"; value: string }
  >;
};

const mockChapters: Record<string, Record<string, ChapterContent>> = {
  "1": {
    ch1: {
      id: "ch1",
      title: "Introduction to 3D space",
      duration: "8 min",
      content: [
        { type: "text", value: "In this chapter, you’ll build the mental model of 3D coordinates and depth." },
        { type: "tip", value: "Tip: Always anchor your reasoning with axes: X (left/right), Y (up/down), Z (depth)." },
        { type: "checkpoint", value: "Checkpoint: Can you explain the difference between 2D and 3D coordinates?" },
      ],
    },
    ch2: {
      id: "ch2",
      title: "Understanding Polyhedrons",
      duration: "12 min",
      content: [
        { type: "text", value: "Polyhedrons are 3D shapes with flat polygonal faces, edges, and vertices." },
        { type: "tip", value: "Tip: Start with tetrahedron, cube, and octahedron — it’s the fastest way to build intuition." },
        { type: "checkpoint", value: "Checkpoint: List the number of faces/edges/vertices for a cube." },
      ],
    },
  },
};

export function ChapterPage() {
  const { courseId, chapterId } = useParams();
  const navigate = useNavigate();

  const chapter = useMemo(() => {
    if (!courseId || !chapterId) return null;
    return mockChapters[courseId]?.[chapterId] ?? null;
  }, [courseId, chapterId]);

  if (!courseId || !chapterId) {
    return null;
  }

  if (!chapter) {
    return (
      <div className="relative p-8">
        <div className="pointer-events-none absolute inset-0 opacity-40 space-grid" />
        <div className="relative mx-auto max-w-4xl">
          <HudFrame className="p-6">
            <h1 className="text-foreground">Chapter not found</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              This chapter doesn’t exist yet in mock data.
            </p>
            <div className="mt-4">
              <Button variant="secondary" className="rounded-xl" onClick={() => navigate(`/app/courses/${courseId}`)}>
                Back to course
              </Button>
            </div>
          </HudFrame>
        </div>
      </div>
    );
  }

  return (
    <div className="relative p-8">
      <div className="pointer-events-none absolute inset-0 opacity-40 space-grid" />

      <div className="relative mx-auto max-w-5xl space-y-6">
        <HudFrame className="p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <BookOpen className="h-4 w-4 text-secondary" />
                Course {courseId} • Chapter {chapter.id}
                <span className="mx-2 opacity-40">•</span>
                <Clock className="h-4 w-4 text-primary" />
                {chapter.duration}
              </div>

              <h1 className="mt-2 text-foreground">{chapter.title}</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                This is the chapter reader (mock). Later it will render your MD blocks / API payload.
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                variant="secondary"
                className="rounded-xl"
                onClick={() => navigate(`/app/courses/${courseId}`)}
              >
                <ArrowLeft className="h-4 w-4" />
                Course
              </Button>
              <Button
  variant="secondary"
  className="rounded-xl"
  onClick={() => navigate(`/app/courses/${courseId}/chapters/${chapterId}/immersive`)}
>
  Immersive
  <ArrowRight className="ml-2 h-4 w-4" />
</Button>
              <Button className="rounded-xl" onClick={() => console.log("mark as complete")}>
                Mark complete
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>

            </div>
          </div>
        </HudFrame>


        <HudFrame className="p-6">
          <div className="space-y-4">
            {chapter.content.map((block, idx) => {
              if (block.type === "text") {
                return (
                  <p key={idx} className="text-sm leading-6 text-muted-foreground">
                    {block.value}
                  </p>
                );
              }

              if (block.type === "tip") {
                return (
                  <div
                    key={idx}
                    className="rounded-2xl border border-secondary/20 bg-secondary/10 p-4 text-sm text-foreground"
                  >
                    <div className="font-medium text-secondary">Tip</div>
                    <div className="mt-1 text-muted-foreground">{block.value}</div>
                  </div>
                );
              }

              return (
                <div
                  key={idx}
                  className="rounded-2xl border border-primary/20 bg-primary/10 p-4 text-sm text-foreground"
                >
                  <div className="font-medium text-primary">Checkpoint</div>
                  <div className="mt-1 text-muted-foreground">{block.value}</div>
                </div>
              );
            })}
          </div>
        </HudFrame>
      </div>
    </div>
  );
}