import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";

vi.mock("../../db/prisma", () => ({
  prisma: {
    course: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
    },
  },
}));

import { buildApp, mockCourse, mockCourseDetail } from "../helpers";
import { prisma } from "../../db/prisma";

const app = buildApp();

beforeEach(() => {
  vi.clearAllMocks();
});

describe("GET /courses", () => {
  it("retourne 200 avec la liste des cours", async () => {
    vi.mocked(prisma.course.findMany).mockResolvedValue([mockCourse] as any);

    const res = await request(app).get("/courses");

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].slug).toBe("microgravity");
    expect(res.body[0]._count.capsules).toBe(1);
  });

  it("retourne 200 avec un tableau vide si aucun cours", async () => {
    vi.mocked(prisma.course.findMany).mockResolvedValue([]);

    const res = await request(app).get("/courses");

    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });
});

describe("GET /courses/:id", () => {
  it("retourne 200 avec le détail complet du cours via l'id", async () => {
    vi.mocked(prisma.course.findFirst).mockResolvedValue(mockCourseDetail as any);

    const res = await request(app).get("/courses/course-1");

    expect(res.status).toBe(200);
    expect(res.body.id).toBe("course-1");
    expect(res.body.capsules).toHaveLength(1);
    expect(res.body.capsules[0].modules).toHaveLength(1);
    expect(res.body.capsules[0].modules[0].chapters).toHaveLength(1);
  });

  it("retourne 200 en cherchant par slug", async () => {
    vi.mocked(prisma.course.findFirst).mockResolvedValue(mockCourseDetail as any);

    const res = await request(app).get("/courses/microgravity");

    expect(res.status).toBe(200);
    expect(res.body.slug).toBe("microgravity");
  });

  it("retourne 404 si le cours n'existe pas", async () => {
    vi.mocked(prisma.course.findFirst).mockResolvedValue(null);

    const res = await request(app).get("/courses/inexistant");

    expect(res.status).toBe(404);
    expect(res.body.error).toBe("Course not found");
  });
});
