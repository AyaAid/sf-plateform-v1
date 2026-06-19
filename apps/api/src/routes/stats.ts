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

  type Completion = (typeof completions)[number];

  // XP = completed chapters × 100 + sum of scores
  const xp =
    completions.length * 100 +
    completions.reduce((sum: number, p: Completion) => sum + (p.score ?? 0), 0);

  // Level = floor(xp / 500), minimum 1
  const level = Math.max(1, Math.floor(xp / 500));

  // Streak = consecutive days with at least 1 completion
  const uniqueDates: string[] = [
    ...new Set<string>(
      completions.map((p: Completion) => p.updatedAt.toISOString().split("T")[0])
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
  const dayOfWeek = now.getDay();
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((dayOfWeek + 6) % 7));
  monday.setHours(0, 0, 0, 0);

  const weeklyMinutes = completions
    .filter((p: Completion) => p.updatedAt >= monday)
    .reduce((sum: number, p: Completion) => sum + (p.chapter.estMin ?? 0), 0);

  // Daily minutes = sum of estMin for completions since midnight today
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const dailyMinutes = completions
    .filter((p: Completion) => p.updatedAt >= todayStart)
    .reduce((sum: number, p: Completion) => sum + (p.chapter.estMin ?? 0), 0);

  // Weekly capsules = unique capsules with ≥1 chapter COMPLETED this week
  const weeklyCompletions = await prisma.progress.findMany({
    where: { userId, status: "COMPLETED", updatedAt: { gte: monday } },
    include: {
      chapter: {
        select: { module: { select: { capsule: { select: { id: true } } } } },
      },
    },
  });
  type WeeklyCompletion = (typeof weeklyCompletions)[number];
  const weeklyCapsules = new Set<string>(
    weeklyCompletions.map((p: WeeklyCompletion) => p.chapter.module.capsule.id)
  ).size;

  return res.json({ xp, level, streak, weeklyMinutes, dailyMinutes, weeklyCapsules });
});
