import { Router } from "express";
import multer from "multer";
import crypto from "crypto";
import path from "path";
import { requireAuth, AuthRequest } from "../middleware/requireAuth";
import { prisma } from "../db/prisma";
import { storage } from "../storage";

export const usersRouter = Router();
usersRouter.use(requireAuth);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/webp"];
    cb(null, allowed.includes(file.mimetype));
  },
});

const USER_SELECT = {
  id: true,
  email: true,
  name: true,
  createdAt: true,
  role: true,
  avatarUrl: true,
} as const;

// GET /users/me
usersRouter.get("/me", async (req: AuthRequest, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.userId! },
    select: USER_SELECT,
  });
  if (!user) return res.status(404).json({ error: "User not found" });
  return res.json(user);
});

// PATCH /users/avatar
usersRouter.patch("/avatar", upload.single("avatar"), async (req: AuthRequest, res) => {
  if (!req.file) return res.status(400).json({ error: "No file provided" });

  const userId = req.userId!;
  const current = await prisma.user.findUnique({ where: { id: userId }, select: { avatarUrl: true } });

  const ext = path.extname(req.file.originalname) || ".jpg";
  const filename = `${userId}-${crypto.randomBytes(8).toString("hex")}${ext}`;
  const avatarUrl = await storage.upload(req.file.buffer, filename, req.file.mimetype);

  if (current?.avatarUrl) {
    await storage.delete(current.avatarUrl).catch(() => {});
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data: { avatarUrl },
    select: USER_SELECT,
  });

  return res.json(user);
});
