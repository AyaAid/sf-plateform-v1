import { Router } from "express";
import { prisma } from "../db/prisma";
import { requireAuth, AuthRequest } from "../middleware/requireAuth";

export const enrollmentsRouter = Router();

enrollmentsRouter.use(requireAuth);

// POST /enrollments/:courseId — enroll in a course
enrollmentsRouter.post("/:courseId", async (req: AuthRequest, res) => {
  const courseId = req.params.courseId as string;
  const userId = req.userId!;

  const course = await prisma.course.findUnique({ where: { id: courseId } });
  if (!course) return res.status(404).json({ error: "Course not found" });

  await prisma.enrollment.upsert({
    where: { userId_courseId: { userId, courseId } },
    create: { userId, courseId },
    update: {},
  });

  return res.status(201).json({ ok: true });
});

// DELETE /enrollments/:courseId — unenroll from a course
enrollmentsRouter.delete("/:courseId", async (req: AuthRequest, res) => {
  const courseId = req.params.courseId as string;
  const userId = req.userId!;

  await prisma.enrollment.deleteMany({ where: { userId, courseId } });

  return res.json({ ok: true });
});

// GET /enrollments — list enrolled courses with progress %
enrollmentsRouter.get("/", async (req: AuthRequest, res) => {
  const userId = req.userId!;

  const enrollments = await prisma.enrollment.findMany({
    where: { userId },
    include: {
      course: {
        include: {
          capsules: {
            include: {
              modules: {
                include: {
                  chapters: {
                    include: {
                      progress: { where: { userId } },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    orderBy: { enrolledAt: "desc" },
  });

  const result = enrollments.map((e) => {
    const allChapters = e.course.capsules.flatMap((cap) =>
      cap.modules.flatMap((mod) => mod.chapters)
    );
    const total = allChapters.length;
    const completed = allChapters.filter((ch) =>
      ch.progress.some((p) => p.status === "COMPLETED")
    ).length;

    const lastActivity = allChapters
      .flatMap((ch) => ch.progress)
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())[0]
      ?.updatedAt.toISOString();

    return {
      courseId: e.course.id,
      courseSlug: e.course.slug,
      title: e.course.title,
      level: e.course.level,
      description: e.course.description,
      isPremium: e.course.isPremium,
      enrolledAt: e.enrolledAt.toISOString(),
      progress: total > 0 ? Math.round((completed / total) * 100) : 0,
      totalChapters: total,
      completedChapters: completed,
      lastActivityAt: lastActivity ?? null,
    };
  });

  return res.json(result);
});
