import React from "react";
import { useNavigate } from "react-router-dom";
import { Search, ArrowRight, Layers } from "lucide-react";
import { Input } from "@/shared/ui/Input";
import { Button } from "@/shared/ui/Button";
import { Select } from "@/shared/ui/Select";
import { HudFrame } from "@/shared/ui/HudFrame";
import { useCourses } from "@/hooks/useCourses";

const CARD_PALETTE = [
  { from: "rgba(108,92,231,0.8)",  to: "rgba(79,70,229,0.8)"  },
  { from: "rgba(16,185,129,0.8)",  to: "rgba(13,148,136,0.8)" },
  { from: "rgba(236,72,153,0.8)",  to: "rgba(225,29,72,0.8)"  },
  { from: "rgba(249,115,22,0.8)",  to: "rgba(245,158,11,0.8)" },
  { from: "rgba(6,182,212,0.8)",   to: "rgba(14,165,233,0.8)" },
  { from: "rgba(217,70,239,0.8)",  to: "rgba(168,85,247,0.8)" },
];

const levelOptions = [
  { value: "all", label: "All Levels" },
  { value: "Beginner", label: "Beginner" },
  { value: "Intermediate", label: "Intermediate" },
  { value: "Advanced", label: "Advanced" },
];

export function CourseCatalogPage() {
  const navigate = useNavigate();
  const { data: courses = [], isLoading: loading, isError } = useCourses();
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedLevel, setSelectedLevel] = React.useState<string>("all");

  const filtered = React.useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return courses.filter((c) => {
      const matchesSearch =
        !q ||
        c.title.toLowerCase().includes(q) ||
        (c.description ?? "").toLowerCase().includes(q);
      const matchesLevel = selectedLevel === "all" || c.level === selectedLevel;
      return matchesSearch && matchesLevel;
    });
  }, [courses, searchQuery, selectedLevel]);

  return (
    <div className="p-8">
      <div className="mx-auto max-w-7xl space-y-8">

        {/* Header */}
        <div className="relative">
          <div className="absolute -left-4 top-0 h-full w-1 bg-gradient-to-b from-white/20 via-violet-500/60 to-transparent opacity-70" />
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-white">Course Catalog</h1>
            <p className="mt-1 text-sm text-white/60">Explore our comprehensive spatial learning courses</p>
          </div>
        </div>

        {/* Filters */}
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

        {loading && (
          <div className="py-16 text-center text-sm text-white/50">Chargement des cours...</div>
        )}

        {isError && (
          <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-6 text-center text-sm text-red-200">
            Impossible de charger les cours.
          </div>
        )}

        {!loading && !isError && (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map((course, idx) => {
              const palette = CARD_PALETTE[idx % CARD_PALETTE.length];
              return (
                <HudFrame
                  key={course.id}
                  className="cursor-pointer p-5 transition-all hover:-translate-y-1"
                  onClick={() => navigate(`/app/courses/${course.id}`)}
                >
                  {/* Thumbnail */}
                  <div
                    className="relative mb-4 flex h-24 items-center justify-center overflow-hidden rounded-xl"
                    style={{ background: `linear-gradient(135deg, ${palette.from}, ${palette.to})` }}
                  >
                    <div className="absolute inset-0 bg-black/10" />
                    <div className="relative z-10 h-10 w-10 rotate-45 rounded-lg border-2 border-white/30 backdrop-blur-sm">
                      <div className="absolute inset-1.5 rounded-md border border-white/20" />
                    </div>
                  </div>

                  {/* Title + level */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="truncate text-sm font-semibold text-foreground">{course.title}</h3>
                      <p className="mt-0.5 line-clamp-2 text-xs leading-5 text-muted-foreground">
                        {course.description}
                      </p>
                    </div>
                    <span className="shrink-0 rounded-full border border-primary/20 bg-primary/10 px-2.5 py-0.5 text-[11px] text-foreground">
                      {course.level ?? "—"}
                    </span>
                  </div>

                  {/* Meta */}
                  <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                    <Layers className="h-3.5 w-3.5 text-primary/70" />
                    <span>{course._count.capsules} capsule{course._count.capsules !== 1 ? "s" : ""}</span>
                    {course.isPremium && (
                      <>
                        <span>•</span>
                        <span className="text-amber-400">Premium</span>
                      </>
                    )}
                  </div>

                  {/* CTA */}
                  <Button
                    className="mt-4 w-full rounded-xl"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/app/courses/${course.id}`);
                    }}
                  >
                    Voir le cours
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </HudFrame>
              );
            })}
          </div>
        )}

        {!loading && !isError && filtered.length === 0 && (
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-8 text-center text-sm text-white/60">
            No course matches your search.
          </div>
        )}
      </div>
    </div>
  );
}
