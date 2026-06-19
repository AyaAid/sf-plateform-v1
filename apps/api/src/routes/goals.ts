import { Router } from "express";
import { prisma } from "../db/prisma";
import { requireAuth, AuthRequest } from "../middleware/requireAuth";

export const goalsRouter = Router();

goalsRouter.use(requireAuth);

goalsRouter.get("/", async (req: AuthRequest, res) => {
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: req.userId! },
    select: { goalDaily: true, goalWeekly: true, goalStreak: true },
  });
  return res.json({ daily: user.goalDaily, weekly: user.goalWeekly, streak: user.goalStreak });
});

goalsRouter.put("/", async (req: AuthRequest, res) => {
  const { daily, weekly, streak } = req.body as {
    daily: number;
    weekly: number;
    streak: number;
  };
  const user = await prisma.user.update({
    where: { id: req.userId! },
    data: { goalDaily: daily, goalWeekly: weekly, goalStreak: streak },
  });
  return res.json({ daily: user.goalDaily, weekly: user.goalWeekly, streak: user.goalStreak });
});
