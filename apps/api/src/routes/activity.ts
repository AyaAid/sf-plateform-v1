import { Router } from "express";
import { prisma } from "../db/prisma";
import { requireAuth, AuthRequest } from "../middleware/requireAuth";

export const activityRouter = Router();

activityRouter.use(requireAuth);

// GET /activity?limit=10 — recent progress events with chapter/course info
activityRouter.get("/", async (req: AuthRequest, res) => {
  const userId = req.userId!;
  const limit = Math.min(Number(req.query.limit) || 10, 50);

  const records = await prisma.progress.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    take: limit,
    include: {
      chapter: {
        select: {
          id: true,
          title: true,
          module: {
            select: {
              capsule: {
                select: {
                  course: {
                    select: { id: true, slug: true, title: true },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  type ActivityRow = (typeof records)[number];
  const result = records.map((r: ActivityRow) => ({
    chapterId: r.chapterId,
    chapterTitle: r.chapter.title,
    courseId: r.chapter.module.capsule.course.id,
    courseSlug: r.chapter.module.capsule.course.slug,
    courseTitle: r.chapter.module.capsule.course.title,
    status: r.status,
    score: r.score,
    updatedAt: r.updatedAt.toISOString(),
  }));

  return res.json(result);
});
