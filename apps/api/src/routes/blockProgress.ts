import { Router } from "express";
import { prisma } from "../db/prisma";
import { requireAuth, AuthRequest } from "../middleware/requireAuth";

export const blockProgressRouter = Router();

blockProgressRouter.use(requireAuth);

// GET /block-progress/:chapterId — answered block IDs for the authenticated user
blockProgressRouter.get("/:chapterId", async (req: AuthRequest, res) => {
  const chapterId = req.params.chapterId as string;
  const userId = req.userId!;

  const records = await prisma.blockProgress.findMany({
    where: { userId, chapterId },
    select: { blockId: true, answeredAt: true },
  });

  return res.json(records);
});

// POST /block-progress — mark a block as answered
blockProgressRouter.post("/", async (req: AuthRequest, res) => {
  const { chapterId, blockId } = req.body as { chapterId: string; blockId: string };
  const userId = req.userId!;

  if (!chapterId || !blockId) {
    return res.status(400).json({ error: "chapterId and blockId are required" });
  }

  await prisma.blockProgress.createMany({
    data: [{ userId, chapterId, blockId }],
    skipDuplicates: true,
  });

  return res.status(201).json({ ok: true });
});
