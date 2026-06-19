import dotenv from "dotenv";
import path from "path";
import express from "express";
import cors from "cors";
import { authRouter } from "./routes/auth";
import { chaptersRouter } from "./routes/chapters";
import { coursesRouter } from "./routes/courses";
import { progressRouter } from "./routes/progress";
import { enrollmentsRouter } from "./routes/enrollments";
import { statsRouter } from "./routes/stats";
import { blockProgressRouter } from "./routes/blockProgress";
import { activityRouter } from "./routes/activity";
import { goalsRouter } from "./routes/goals";
import { adminRouter } from "./routes/admin";
import { usersRouter } from "./routes/users";
import { aiRouter } from "./routes/ai";
import { errorHandler } from "./middleware/errorHandler";

dotenv.config();

const app = express();

const corsOrigin = process.env.CORS_ORIGIN;
app.use(cors({
  origin: corsOrigin ? corsOrigin.split(",") : true,
  credentials: true,
}));
app.use(express.json());
app.use("/uploads", express.static(path.join(process.cwd(), "public", "uploads")));

app.get("/health", (_req, res) => res.json({ ok: true, service: "api" }));

app.get("/debug-db", async (_req, res) => {
  try {
    const { prisma } = await import("./db/prisma");
    const count = await prisma.course.count();
    res.json({ ok: true, courses: count, dbUrl: process.env.DATABASE_URL?.slice(0, 40) + "..." });
  } catch (err: unknown) {
    res.status(500).json({ error: (err as Error).message, stack: (err as Error).stack?.slice(0, 500) });
  }
});

app.use("/auth", authRouter);
app.use("/courses", coursesRouter);
app.use("/chapters", chaptersRouter);
app.use("/progress", progressRouter);
app.use("/enrollments", enrollmentsRouter);
app.use("/stats", statsRouter);
app.use("/block-progress", blockProgressRouter);
app.use("/activity", activityRouter);
app.use("/goals", goalsRouter);
app.use("/admin", adminRouter);
app.use("/users", usersRouter);
app.use("/ai", aiRouter);
app.use(errorHandler);

export default app;

if (require.main === module) {
  const port = Number(process.env.PORT || 3001);
  app.listen(port, () => console.log(`API running on http://localhost:${port}`));
}
