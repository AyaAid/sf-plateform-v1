// ── Auth ──────────────────────────────────────────────────────────────────────

export type AuthUser = {
  id: string;
  email: string;
  name: string | null;
  createdAt: string;
};

export type AuthResponse = {
  token: string;
  user: AuthUser;
};

// ── Courses ───────────────────────────────────────────────────────────────────

export type CourseLevel = "Beginner" | "Intermediate" | "Advanced";

export type CourseSummary = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  level: string | null;
  isPremium: boolean;
  createdAt: string;
  _count: { capsules: number };
};

export type ChapterSummary = {
  id: string;
  title: string;
  sortOrder: number;
  estMin: number | null;
  mdPath: string;
};

export type ModuleDetail = {
  id: string;
  title: string;
  sortOrder: number;
  isLocked: boolean;
  chapters: ChapterSummary[];
};

export type CapsuleDetail = {
  id: string;
  title: string;
  sortOrder: number;
  modules: ModuleDetail[];
};

export type CourseDetail = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  level: string | null;
  isPremium: boolean;
  createdAt: string;
  capsules: CapsuleDetail[];
};

export type ChapterWithMarkdown = {
  chapter: ChapterSummary & { moduleId: string };
  markdown: string;
};

// ── Progress ──────────────────────────────────────────────────────────────────

export type ProgressStatus = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";

export type ProgressRecord = {
  chapterId: string;
  status: ProgressStatus;
  score: number | null;
  updatedAt: string;
};
