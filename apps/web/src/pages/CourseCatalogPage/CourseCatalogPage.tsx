import React from "react";
import { Search, Clock, BarChart, Star } from "lucide-react";
import { Input } from "@/shared/ui/Input";
import { Button } from "@/shared/ui/Button";
import { Badge } from "@/shared/ui/Badge";
import { Select } from "@/shared/ui/Select";
import { COURSES } from "./courses.data";
import type { CourseLevel } from "./types";
import { HudFrame } from "@/shared/ui/HudFrame";
import { cn } from "@/shared/cn";

type Props = {
  onCourseSelect?: (courseId: string) => void;
};

const levelOptions = [
  { value: "all", label: "All Levels" },
  { value: "Beginner", label: "Beginner" },
  { value: "Intermediate", label: "Intermediate" },
  { value: "Advanced", label: "Advanced" },
];

export function CourseCatalogPage({ onCourseSelect }: Props) {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedLevel, setSelectedLevel] = React.useState<string>("all");

  const filtered = React.useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return COURSES.filter((c) => {
      const matchesSearch =
        !q ||
        c.title.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q);

      const matchesLevel =
        selectedLevel === "all" || c.level === (selectedLevel as CourseLevel);

      return matchesSearch && matchesLevel;
    });
  }, [searchQuery, selectedLevel]);

  return (
    <div className="p-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="relative">
          <div className="absolute -left-4 top-0 h-full w-1 bg-gradient-to-b from-white/20 via-violet-500/60 to-transparent opacity-70" />
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-white">
              Course Catalog
            </h1>
            <p className="mt-1 text-sm text-white/60">
              Explore our comprehensive spatial learning courses
            </p>
          </div>
        </div>

        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/50" />
            <Input
              placeholder="Search courses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-11"
              style={{
                background: "rgba(26, 31, 51, 0.8)",
                backdropFilter: "blur(8px)",
                boxShadow: "inset 0 2px 8px rgba(0, 0, 0, 0.3)",
              }}
            />
          </div>

          <div className="w-56">
            <Select
              value={selectedLevel}
              onChange={setSelectedLevel}
              options={levelOptions}
              placeholder="Level"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
  {filtered.map((course) => (
    <HudFrame
      key={course.id}
      accent="purple"
      className="cursor-pointer transition-all hover:-translate-y-1"
      onClick={() => onCourseSelect?.(course.id)}
    >
      <div
        className={cn(
          "relative flex h-40 items-center justify-center overflow-hidden rounded-2xl",
          course.colorClass
        )}
      >
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative z-10 h-20 w-20 rotate-12 rounded-2xl border-2 border-white/30 backdrop-blur-sm">
          <div className="absolute inset-2 rounded-lg border border-white/20" />
        </div>
      </div>

      <div className="space-y-4 p-5">
        <div className="flex items-start justify-between gap-3">
          <Badge
            className="border border-primary/20 bg-primary/10 text-foreground"
          >
            {course.level}
          </Badge>

          <div className="flex items-center gap-1 text-sm text-foreground">
            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
            <span>{course.rating.toFixed(1)}</span>
          </div>
        </div>

        <div>
          <h3 className="mb-1 text-base font-semibold text-foreground">
            {course.title}
          </h3>
          <p className="text-sm leading-6 text-muted-foreground">
            {course.description}
          </p>
        </div>

        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4 text-secondary" />
            <span>{course.duration}</span>
          </div>
          <div className="flex items-center gap-1">
            <BarChart className="h-4 w-4 text-primary" />
            <span>{course.lessons} lessons</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <span className="text-xs text-muted-foreground">
            {course.enrolled.toLocaleString()} enrolled
          </span>

          <Button
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onCourseSelect?.(course.id);
            }}
          >
            Enroll
          </Button>
        </div>
      </div>
    </HudFrame>
  ))}
</div>

        {filtered.length === 0 && (
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-8 text-center text-sm text-white/60">
            No course matches your search.
          </div>
        )}
      </div>
    </div>
  );
}