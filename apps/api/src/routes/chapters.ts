import { Router } from "express";
import { prisma } from "../db/prisma";
import path from "path";
import fs from "fs/promises";
import { parseModule } from "../lib/moduleParser";

export const chaptersRouter = Router();

chaptersRouter.get("/:id", async (req, res) => {
  const { id } = req.params;

  const chapter = await prisma.chapter.findUnique({ where: { id } });
  if (!chapter) return res.status(404).json({ error: "Chapter not found" });

  const fullPath = path.join(process.cwd(), "content", chapter.mdPath);
  try {
    const raw = await fs.readFile(fullPath, "utf-8");
    const { frontmatter, blocks } = parseModule(raw);
    return res.json({ chapter, frontmatter, blocks });
  } catch {
    return res.status(500).json({ error: "Markdown file not found", mdPath: chapter.mdPath });
  }
});
