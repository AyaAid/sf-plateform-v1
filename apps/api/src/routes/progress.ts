import { Router } from "express";
import { progressUpsertSchema } from "@stars-factory/shared";
import { prisma } from "../db/prisma";
import { requireAuth, AuthRequest } from "../middleware/requireAuth";

export const progressRouter = Router();

progressRouter.use(requireAuth);

// GET /progress — all progress records for the authenticated user
progressRouter.get("/", async (req: AuthRequest, res) => {
  const records = await prisma.progress.findMany({
    where: { userId: req.userId! },
    select: {
      chapterId: true,
      status: true,
      score: true,
      updatedAt: true,
    },
  });
  return res.json(records);
});

// PUT /progress — upsert a progress record
progressRouter.put("/", async (req: AuthRequest, res) => {
  const parsed = progressUpsertSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues });
  }

  const { chapterId, status, score } = parsed.data;
  const userId = req.userId!;

  // Never downgrade a COMPLETED record back to IN_PROGRESS
  if (status === "IN_PROGRESS") {
    const existing = await prisma.progress.findUnique({
      where: { userId_chapterId: { userId, chapterId } },
      select: { status: true, score: true, chapterId: true, updatedAt: true },
    });
    if (existing?.status === "COMPLETED") {
      return res.json(existing);
    }
  }

  const record = await prisma.progress.upsert({
    where: { userId_chapterId: { userId, chapterId } },
    create: { userId, chapterId, status, score },
    update: { status, score },
  });

  return res.json(record);
});
