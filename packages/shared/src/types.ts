// ── Auth ──────────────────────────────────────────────────────────────────────

export type AuthUser = {
  id: string;
  email: string;
  name: string | null;
  createdAt: string;
  role: "USER" | "ADMIN";
  avatarUrl?: string | null;
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

// ── Module blocks ──────────────────────────────────────────────────────────

export type TextBlock = {
  type: "text";
  id?: string;
  title: string;
  content: string;
};

export type QuizBlock = {
  type: "quiz";
  id?: string;
  question: string;
  options: string[];
  correct_answer: string;
  explanation: string;
};

export type QuizMultiBlock = {
  type: "quiz_multi";
  id?: string;
  question: string;
  options: string[];
  correct_answers: string[];
  explanation: string;
};

export type QuizTextBlock = {
  type: "quiz-text";
  id?: string;
  question: string;
  expected_points: string[];
  sample_answer: string;
};

export type MissionStep = {
  prompt: string;
  options: string[];
  correct_answer: string;
  feedback_correct: string;
  feedback_wrong: string;
};

export type MissionBlock = {
  type: "mission";
  id?: string;
  title: string;
  scenario: string;
  steps: MissionStep[];
  mission_success: string;
};

export type CaseStudyBlock = {
  type: "case-study";
  id?: string;
  title: string;
  case: string;
  questions: string[];
  correction: string;
};

export type ContentBlock =
  | TextBlock
  | QuizBlock
  | QuizMultiBlock
  | QuizTextBlock
  | MissionBlock
  | CaseStudyBlock;

export type ModuleFrontmatter = {
  id: string;
  slug: string;
  title: string;
  capsule: string;
  chapter: string;
  level: "beginner" | "intermediate" | "advanced";
  duration_minutes: number;
  available: boolean;
  tags: string[];
  learning_objectives: string[];
  sources: string[];
};

export type ChapterWithMarkdown = {
  chapter: ChapterSummary & { moduleId: string };
  markdown: string;
};

export type ChapterWithBlocks = {
  chapter: ChapterSummary & { moduleId: string };
  frontmatter: ModuleFrontmatter;
  blocks: ContentBlock[];
};

// ── Enrollment ────────────────────────────────────────────────────────────────

export type EnrollmentSummary = {
  courseId: string;
  courseSlug: string;
  title: string;
  level: string | null;
  description: string | null;
  isPremium: boolean;
  enrolledAt: string;
  progress: number;
  totalChapters: number;
  completedChapters: number;
  startedChapters: number;
  lastActivityAt: string | null;
};

// ── Goals ─────────────────────────────────────────────────────────────────────

export type UserGoals = {
  daily: number;
  weekly: number;
  streak: number;
};

// ── Stats ─────────────────────────────────────────────────────────────────────

export type UserStats = {
  xp: number;
  level: number;
  streak: number;
  weeklyMinutes: number;
  dailyMinutes: number;
  weeklyCapsules: number;
};

// ── Block Progress ────────────────────────────────────────────────────────────

export type BlockProgressRecord = {
  blockId: string;
  answeredAt: string;
};

// ── Progress ──────────────────────────────────────────────────────────────────

export type ProgressStatus = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";

export type ActivityRecord = {
  chapterId: string;
  chapterTitle: string;
  courseId: string;
  courseSlug: string;
  courseTitle: string;
  status: ProgressStatus;
  score: number | null;
  updatedAt: string;
};

export type ProgressRecord = {
  chapterId: string;
  status: ProgressStatus;
  score: number | null;
  updatedAt: string;
};
