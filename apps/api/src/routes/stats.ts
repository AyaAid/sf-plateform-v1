import { Router } from "express";
import { prisma } from "../db/prisma";
import { requireAuth, AuthRequest } from "../middleware/requireAuth";

export const statsRouter = Router();

statsRouter.use(requireAuth);

// GET /stats — computed user stats from progress records
statsRouter.get("/", async (req: AuthRequest, res) => {
  const userId = req.userId!;

  const completions = await prisma.progress.findMany({
    where: { userId, status: "COMPLETED" },
    include: { chapter: { select: { estMin: true } } },
    orderBy: { updatedAt: "desc" },
  });

  // XP = completed chapters × 100 + sum of scores
  const xp =
    completions.length * 100 +
    completions.reduce((sum, p) => sum + (p.score ?? 0), 0);

  // Level = floor(xp / 500), minimum 1
  const level = Math.max(1, Math.floor(xp / 500));

  // Streak = consecutive days with at least 1 completion
  const uniqueDates = [
    ...new Set(
      completions.map((p) => p.updatedAt.toISOString().split("T")[0])
    ),
  ].sort().reverse();

  let streak = 0;
  const today = new Date().toISOString().split("T")[0];
  let expected = today;
  for (const date of uniqueDates) {
    if (date === expected) {
      streak++;
      const d = new Date(expected);
      d.setDate(d.getDate() - 1);
      expected = d.toISOString().split("T")[0];
    } else if (date < expected) {
      break;
    }
  }

  // Weekly minutes = sum of estMin for completions this week (Mon–Sun)
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0 = Sunday
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((dayOfWeek + 6) % 7));
  monday.setHours(0, 0, 0, 0);

  const weeklyMinutes = completions
    .filter((p) => p.updatedAt >= monday)
    .reduce((sum, p) => sum + (p.chapter.estMin ?? 0), 0);

  return res.json({ xp, level, streak, weeklyMinutes });
});
