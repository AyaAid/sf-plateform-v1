import express from "express";
import { authRouter } from "../routes/auth";
import { coursesRouter } from "../routes/courses";
import { chaptersRouter } from "../routes/chapters";
import { progressRouter } from "../routes/progress";
import { errorHandler } from "../middleware/errorHandler";

export function buildApp() {
  const app = express();
  app.use(express.json());
  app.use("/auth", authRouter);
  app.use("/courses", coursesRouter);
  app.use("/chapters", chaptersRouter);
  app.use("/progress", progressRouter);
  app.use(errorHandler);
  return app;
}

export const mockUser = {
  id: "user-1",
  email: "test@example.com",
  name: "Test User",
  passwordHash: null as string | null,
  createdAt: new Date(),
};

// Shape retournée par les routes qui utilisent select sans passwordHash
export const mockUserPublic = {
  id: "user-1",
  email: "test@example.com",
  name: "Test User",
  createdAt: new Date(),
};

// Shape retournée par GET /progress
export const mockProgressRecord = {
  chapterId: "chapter-1",
  status: "IN_PROGRESS" as const,
  score: null,
  updatedAt: new Date(),
};

// Shape retournée par GET /chapters/:id
export const mockChapter = {
  id: "chapter-1",
  moduleId: "module-1",
  title: "Chapitre 1 — Bienvenue",
  sortOrder: 1,
  estMin: 10,
  mdPath: "courses/microgravity/01-welcome.md",
};

// Shape retournée par GET /courses (avec _count)
export const mockCourse = {
  id: "course-1",
  slug: "microgravity",
  title: "Microgravity 101",
  description: "Découvrir les bases de la microgravité",
  level: "Beginner",
  isPremium: false,
  createdAt: new Date(),
  _count: { capsules: 1 },
};

// Shape retournée par GET /courses/:id (avec capsules imbriquées)
export const mockCourseDetail = {
  id: "course-1",
  slug: "microgravity",
  title: "Microgravity 101",
  description: "Découvrir les bases de la microgravité",
  level: "Beginner",
  isPremium: false,
  createdAt: new Date(),
  capsules: [
    {
      id: "capsule-1",
      courseId: "course-1",
      title: "Capsule 1 — Bases",
      sortOrder: 1,
      modules: [
        {
          id: "module-1",
          capsuleId: "capsule-1",
          title: "Module 1 — Introduction",
          sortOrder: 1,
          isLocked: false,
          chapters: [
            {
              id: "chapter-1",
              title: "Chapitre 1 — Bienvenue",
              sortOrder: 1,
              estMin: 10,
              mdPath: "courses/microgravity/01-welcome.md",
            },
          ],
        },
      ],
    },
  ],
};
