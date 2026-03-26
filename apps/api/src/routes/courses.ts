import { Router } from "express";
import { prisma } from "../db/prisma";

export const coursesRouter = Router();

// GET /courses — list all courses
coursesRouter.get("/", async (_req, res) => {
  const courses = await prisma.course.findMany({
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      slug: true,
      title: true,
      description: true,
      level: true,
      isPremium: true,
      createdAt: true,
      _count: { select: { capsules: true } },
    },
  });
  return res.json(courses);
});

// GET /courses/:id — full detail with capsules > modules > chapters
coursesRouter.get("/:id", async (req, res) => {
  const { id } = req.params;

  const course = await prisma.course.findFirst({
    where: { OR: [{ id }, { slug: id }] },
    include: {
      capsules: {
        orderBy: { sortOrder: "asc" },
        include: {
          modules: {
            orderBy: { sortOrder: "asc" },
            include: {
              chapters: {
                orderBy: { sortOrder: "asc" },
                select: {
                  id: true,
                  title: true,
                  sortOrder: true,
                  estMin: true,
                  mdPath: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!course) return res.status(404).json({ error: "Course not found" });
  return res.json(course);
});
