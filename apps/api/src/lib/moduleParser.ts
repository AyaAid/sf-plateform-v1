import matter from "gray-matter";
import yaml from "js-yaml";

// ── Types ──────────────────────────────────────────────────────────────────

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

export type ParsedModule = {
  frontmatter: ModuleFrontmatter;
  blocks: ContentBlock[];
};

// ── Parser ─────────────────────────────────────────────────────────────────

export function parseModule(raw: string): ParsedModule {
  const { data, content } = matter(raw);
  const frontmatter = data as ModuleFrontmatter;

  // Split by "---" separators, filter empty chunks
  const sections = content
    .split(/\n---\n/)
    .map((s) => s.trim())
    .filter(Boolean);

  const blocks: ContentBlock[] = [];
  let blockIndex = 0;

  for (const section of sections) {
    const lines = section.split("\n");

    // Remove heading lines (# ... and ## ...) — they're labels, not data
    const yamlLines = lines.filter((l) => !l.startsWith("#"));
    const yamlContent = yamlLines.join("\n").trim();

    if (!yamlContent) continue;

    let parsed: Record<string, unknown>;
    try {
      parsed = yaml.load(yamlContent) as Record<string, unknown>;
    } catch {
      continue;
    }

    if (!parsed || typeof parsed !== "object" || !parsed.type) continue;

    // Assign a stable id if missing
    if (!parsed.id) {
      parsed.id = `block-${++blockIndex}`;
    }

    blocks.push(parsed as unknown as ContentBlock);
  }

  return { frontmatter, blocks };
}
