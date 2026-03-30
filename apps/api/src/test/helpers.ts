import express from "express";
import { authRouter } from "../routes/auth";
import { coursesRouter } from "../routes/courses";
import { chaptersRouter } from "../routes/chapters";
import { progressRouter } from "../routes/progress";

export function buildApp() {
  const app = express();
  app.use(express.json());
  app.use("/auth", authRouter);
  app.use("/courses", coursesRouter);
  app.use("/chapters", chaptersRouter);
  app.use("/progress", progressRouter);
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
