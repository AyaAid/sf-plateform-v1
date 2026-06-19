import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs/promises";
import { prisma } from "../db/prisma";
import { requireAdmin } from "../middleware/requireAdmin";
import { parseModule } from "../lib/moduleParser";

export const adminRouter = Router();

adminRouter.use(requireAdmin);

const upload = multer({ storage: multer.memoryStorage() });

// ── Validation helper ─────────────────────────────────────────────────────────

type ValidationError = { line: number | null; message: string };

function validateMarkdown(raw: string): ValidationError[] {
  const errors: ValidationError[] = [];

  let frontmatter: Record<string, unknown>;
  try {
    const { parseModule: parse } = require("../lib/moduleParser");
    const result = parse(raw);
    frontmatter = result.frontmatter;
  } catch {
    errors.push({ line: null, message: "Frontmatter YAML invalide" });
    return errors;
  }

  const requiredFrontmatterFields = ["id", "slug", "title", "capsule", "chapter", "level", "duration_minutes"];
  for (const field of requiredFrontmatterFields) {
    if (!frontmatter[field]) {
      errors.push({ line: null, message: `Frontmatter : champ obligatoire manquant — "${field}"` });
    }
  }

  const validLevels = ["beginner", "intermediate", "advanced"];
  if (frontmatter.level && !validLevels.includes(frontmatter.level as string)) {
    errors.push({ line: null, message: `Frontmatter : "level" doit être beginner, intermediate ou advanced` });
  }

  const lines = raw.split("\n");
  const sections = raw.split(/\n---\n/).slice(1);

  let blockIndex = 0;
  let lineOffset = raw.indexOf("\n---\n") + 5;

  for (const section of sections) {
    blockIndex++;
    const sectionLines = section.split("\n");
    const approxLine = raw.slice(0, lineOffset).split("\n").length;

    const yamlLines = sectionLines.filter((l) => !l.startsWith("#"));
    const yamlContent = yamlLines.join("\n").trim();
    if (!yamlContent) { lineOffset += section.length + 5; continue; }

    let parsed: Record<string, unknown>;
    try {
      const yaml = require("js-yaml");
      parsed = yaml.load(yamlContent) as Record<string, unknown>;
    } catch (e: unknown) {
      errors.push({ line: approxLine, message: `Bloc ${blockIndex} : YAML invalide — ${(e as Error).message}` });
      lineOffset += section.length + 5;
      continue;
    }

    if (!parsed?.type) {
      errors.push({ line: approxLine, message: `Bloc ${blockIndex} : champ "type" manquant` });
      lineOffset += section.length + 5;
      continue;
    }

    const type = parsed.type as string;
    const validTypes = ["text", "quiz", "quiz_multi", "quiz-text", "mission", "case-study"];
    if (!validTypes.includes(type)) {
      errors.push({ line: approxLine, message: `Bloc ${blockIndex} : type "${type}" inconnu` });
    }

    if (type === "text") {
      if (!parsed.title) errors.push({ line: approxLine, message: `Bloc ${blockIndex} (text) : "title" manquant` });
      if (!parsed.content) errors.push({ line: approxLine, message: `Bloc ${blockIndex} (text) : "content" manquant` });
    }

    if (type === "quiz") {
      if (!parsed.question) errors.push({ line: approxLine, message: `Bloc ${blockIndex} (quiz) : "question" manquante` });
      if (!Array.isArray(parsed.options) || parsed.options.length < 2) {
        errors.push({ line: approxLine, message: `Bloc ${blockIndex} (quiz) : "options" doit contenir au moins 2 choix` });
      }
      if (!parsed.correct_answer) {
        errors.push({ line: approxLine, message: `Bloc ${blockIndex} (quiz) : "correct_answer" manquant` });
      } else if (Array.isArray(parsed.options) && !parsed.options.includes(parsed.correct_answer)) {
        errors.push({ line: approxLine, message: `Bloc ${blockIndex} (quiz) : "correct_answer" n'existe pas dans "options"` });
      }
      if (!parsed.explanation) errors.push({ line: approxLine, message: `Bloc ${blockIndex} (quiz) : "explanation" manquante` });
    }

    if (type === "quiz_multi") {
      if (!parsed.question) errors.push({ line: approxLine, message: `Bloc ${blockIndex} (quiz_multi) : "question" manquante` });
      if (!Array.isArray(parsed.options) || parsed.options.length < 2) {
        errors.push({ line: approxLine, message: `Bloc ${blockIndex} (quiz_multi) : "options" doit contenir au moins 2 choix` });
      }
      if (!Array.isArray(parsed.correct_answers) || parsed.correct_answers.length < 1) {
        errors.push({ line: approxLine, message: `Bloc ${blockIndex} (quiz_multi) : "correct_answers" manquant ou vide` });
      } else if (Array.isArray(parsed.options)) {
        for (const ans of parsed.correct_answers as string[]) {
          if (!parsed.options.includes(ans)) {
            errors.push({ line: approxLine, message: `Bloc ${blockIndex} (quiz_multi) : "${ans}" dans correct_answers n'existe pas dans options` });
          }
        }
      }
      if (!parsed.explanation) errors.push({ line: approxLine, message: `Bloc ${blockIndex} (quiz_multi) : "explanation" manquante` });
    }

    if (type === "quiz-text") {
      if (!parsed.question) errors.push({ line: approxLine, message: `Bloc ${blockIndex} (quiz-text) : "question" manquante` });
      if (!Array.isArray(parsed.expected_points) || parsed.expected_points.length < 1) {
        errors.push({ line: approxLine, message: `Bloc ${blockIndex} (quiz-text) : "expected_points" manquant ou vide` });
      }
      if (!parsed.sample_answer) errors.push({ line: approxLine, message: `Bloc ${blockIndex} (quiz-text) : "sample_answer" manquant` });
    }

    if (type === "mission") {
      if (!parsed.title) errors.push({ line: approxLine, message: `Bloc ${blockIndex} (mission) : "title" manquant` });
      if (!parsed.scenario) errors.push({ line: approxLine, message: `Bloc ${blockIndex} (mission) : "scenario" manquant` });
      if (!Array.isArray(parsed.steps) || parsed.steps.length < 1) {
        errors.push({ line: approxLine, message: `Bloc ${blockIndex} (mission) : "steps" manquant ou vide` });
      } else {
        (parsed.steps as Record<string, unknown>[]).forEach((step, i) => {
          if (!step.prompt) errors.push({ line: approxLine, message: `Bloc ${blockIndex} (mission) : step ${i + 1} — "prompt" manquant` });
          if (!Array.isArray(step.options)) errors.push({ line: approxLine, message: `Bloc ${blockIndex} (mission) : step ${i + 1} — "options" manquant` });
          if (!step.correct_answer) errors.push({ line: approxLine, message: `Bloc ${blockIndex} (mission) : step ${i + 1} — "correct_answer" manquant` });
        });
      }
      if (!parsed.mission_success) errors.push({ line: approxLine, message: `Bloc ${blockIndex} (mission) : "mission_success" manquant` });
    }

    if (type === "case-study") {
      if (!parsed.title) errors.push({ line: approxLine, message: `Bloc ${blockIndex} (case-study) : "title" manquant` });
      if (!parsed.case) errors.push({ line: approxLine, message: `Bloc ${blockIndex} (case-study) : "case" manquant` });
      if (!Array.isArray(parsed.questions) || parsed.questions.length < 1) {
        errors.push({ line: approxLine, message: `Bloc ${blockIndex} (case-study) : "questions" manquant ou vide` });
      }
      if (!parsed.correction) errors.push({ line: approxLine, message: `Bloc ${blockIndex} (case-study) : "correction" manquante` });
    }

    lineOffset += section.length + 5;
  }

  // suppress unused variable warning
  void lines;

  return errors;
}

// ── GET /admin/courses ────────────────────────────────────────────────────────

adminRouter.get("/courses", async (_req, res) => {
  const courses = await prisma.course.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      capsules: {
        orderBy: { sortOrder: "asc" },
        include: {
          modules: {
            orderBy: { sortOrder: "asc" },
            include: {
              chapters: {
                orderBy: { sortOrder: "asc" },
                select: { id: true, title: true, sortOrder: true, estMin: true, isPublished: true, mdPath: true },
              },
            },
          },
        },
      },
    },
  });
  return res.json(courses);
});

// ── POST /admin/courses ───────────────────────────────────────────────────────

adminRouter.post("/courses", async (req, res) => {
  const { title, description, level, isPremium, slug } = req.body;
  if (!title || !slug) return res.status(400).json({ error: "title et slug sont obligatoires" });

  const existing = await prisma.course.findUnique({ where: { slug } });
  if (existing) return res.status(409).json({ error: "Un cours avec ce slug existe déjà" });

  const course = await prisma.course.create({
    data: { title, description: description ?? null, level: level ?? null, isPremium: isPremium ?? false, slug },
  });
  return res.status(201).json(course);
});

// ── POST /admin/courses/:courseId/capsules ────────────────────────────────────

adminRouter.post("/courses/:courseId/capsules", async (req, res) => {
  const { courseId } = req.params;
  const { title } = req.body;
  if (!title) return res.status(400).json({ error: "title est obligatoire" });

  const course = await prisma.course.findUnique({ where: { id: courseId } });
  if (!course) return res.status(404).json({ error: "Cours introuvable" });

  const last = await prisma.capsule.findFirst({ where: { courseId }, orderBy: { sortOrder: "desc" } });
  const capsule = await prisma.capsule.create({
    data: { courseId, title, sortOrder: (last?.sortOrder ?? 0) + 1 },
  });
  return res.status(201).json(capsule);
});

// ── POST /admin/capsules/:capsuleId/modules ───────────────────────────────────

adminRouter.post("/capsules/:capsuleId/modules", async (req, res) => {
  const { capsuleId } = req.params;
  const { title, isLocked } = req.body;
  if (!title) return res.status(400).json({ error: "title est obligatoire" });

  const capsule = await prisma.capsule.findUnique({ where: { id: capsuleId } });
  if (!capsule) return res.status(404).json({ error: "Capsule introuvable" });

  const last = await prisma.module.findFirst({ where: { capsuleId }, orderBy: { sortOrder: "desc" } });
  const module = await prisma.module.create({
    data: { capsuleId, title, sortOrder: (last?.sortOrder ?? 0) + 1, isLocked: isLocked ?? false },
  });
  return res.status(201).json(module);
});

// ── PATCH /admin/chapters/:chapterId ─────────────────────────────────────────

adminRouter.patch("/chapters/:chapterId", async (req, res) => {
  const chapterId = req.params.chapterId as string;
  const { isPublished } = req.body;
  if (typeof isPublished !== "boolean") {
    return res.status(400).json({ error: "isPublished (boolean) est obligatoire" });
  }

  const chapter = await prisma.chapter.findUnique({ where: { id: chapterId } });
  if (!chapter) return res.status(404).json({ error: "Chapitre introuvable" });

  const updated = await prisma.chapter.update({
    where: { id: chapterId },
    data: { isPublished },
  });
  return res.json(updated);
});

// ── DELETE /admin/chapters/:chapterId ────────────────────────────────────────

adminRouter.delete("/chapters/:chapterId", async (req, res) => {
  const chapterId = req.params.chapterId as string;
  const chapter = await prisma.chapter.findUnique({ where: { id: chapterId } });
  if (!chapter) return res.status(404).json({ error: "Chapitre introuvable" });

  const fullPath = path.join(process.cwd(), "content", chapter.mdPath);
  await prisma.chapter.delete({ where: { id: chapterId } });
  await fs.unlink(fullPath).catch(() => {});

  return res.json({ ok: true });
});

// ── DELETE /admin/modules/:moduleId ──────────────────────────────────────────

adminRouter.delete("/modules/:moduleId", async (req, res) => {
  const moduleId = req.params.moduleId as string;
  const module = await prisma.module.findUnique({
    where: { id: moduleId },
    include: { chapters: true },
  });
  if (!module) return res.status(404).json({ error: "Module introuvable" });

  for (const ch of module.chapters) {
    const fullPath = path.join(process.cwd(), "content", ch.mdPath);
    await fs.unlink(fullPath).catch(() => {});
  }
  await prisma.module.delete({ where: { id: moduleId } });

  return res.json({ ok: true });
});

// ── DELETE /admin/capsules/:capsuleId ─────────────────────────────────────────

adminRouter.delete("/capsules/:capsuleId", async (req, res) => {
  const capsuleId = req.params.capsuleId as string;
  const capsule = await prisma.capsule.findUnique({
    where: { id: capsuleId },
    include: { modules: { include: { chapters: true } } },
  });
  if (!capsule) return res.status(404).json({ error: "Capsule introuvable" });

  for (const mod of capsule.modules) {
    for (const ch of mod.chapters) {
      const fullPath = path.join(process.cwd(), "content", ch.mdPath);
      await fs.unlink(fullPath).catch(() => {});
    }
  }
  await prisma.capsule.delete({ where: { id: capsuleId } });

  return res.json({ ok: true });
});

// ── POST /admin/modules/:moduleId/chapters/validate ──────────────────────────

adminRouter.post("/modules/:moduleId/chapters/validate", upload.single("file"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "Aucun fichier reçu" });

  const raw = req.file.buffer.toString("utf-8");
  const errors = validateMarkdown(raw);
  void req.params.moduleId;

  if (errors.length > 0) {
    return res.json({ valid: false, errors });
  }

  const { frontmatter, blocks } = parseModule(raw);
  return res.json({ valid: true, errors: [], frontmatter, blocks });
});

// ── POST /admin/modules/:moduleId/chapters ────────────────────────────────────

adminRouter.post("/modules/:moduleId/chapters", upload.single("file"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "Aucun fichier reçu" });

  const moduleId = req.params.moduleId as string;
  const { publish } = req.body;
  const isPublished = publish === "true" || publish === true;

  const module = await prisma.module.findUnique({ where: { id: moduleId } });
  if (!module) return res.status(404).json({ error: "Module introuvable" });

  const raw = req.file.buffer.toString("utf-8");
  const errors = validateMarkdown(raw);
  if (errors.length > 0) {
    return res.status(422).json({ error: "Fichier invalide", errors });
  }

  const { frontmatter } = parseModule(raw);

  // Derive course slug from module → capsule → course
  const capsule = await prisma.capsule.findUnique({
    where: { id: module.capsuleId },
    include: { course: true },
  });
  if (!capsule) return res.status(404).json({ error: "Capsule introuvable" });

  const courseSlug = capsule.course.slug;
  const fileName = `${frontmatter.id}.md`;
  const relPath = `courses/${courseSlug}/${fileName}`;
  const fullPath = path.join(process.cwd(), "content", relPath);

  await fs.mkdir(path.dirname(fullPath), { recursive: true });
  await fs.writeFile(fullPath, raw, "utf-8");

  const last = await prisma.chapter.findFirst({ where: { moduleId }, orderBy: { sortOrder: "desc" } });
  const chapter = await prisma.chapter.create({
    data: {
      moduleId,
      title: frontmatter.title,
      sortOrder: (last?.sortOrder ?? 0) + 1,
      mdPath: relPath,
      estMin: frontmatter.duration_minutes ?? null,
      isPublished,
    },
  });

  return res.status(201).json(chapter);
});
