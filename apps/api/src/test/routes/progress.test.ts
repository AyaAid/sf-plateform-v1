import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import jwt from "jsonwebtoken";

vi.mock("../../db/prisma", () => ({
  prisma: {
    progress: {
      findMany: vi.fn(),
      upsert: vi.fn(),
    },
  },
}));

const SECRET = "test-secret";
process.env.JWT_SECRET = SECRET;

import { buildApp, mockProgressRecord } from "../helpers";
import { prisma } from "../../db/prisma";

const app = buildApp();

const validToken = jwt.sign({ userId: "user-1" }, SECRET, { expiresIn: "1h" });

beforeEach(() => {
  vi.clearAllMocks();
});

describe("GET /progress", () => {
  it("retourne 200 avec les enregistrements de l'utilisateur connecté", async () => {
    vi.mocked(prisma.progress.findMany).mockResolvedValue([mockProgressRecord] as any);

    const res = await request(app)
      .get("/progress")
      .set("Authorization", `Bearer ${validToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].chapterId).toBe("chapter-1");
    expect(res.body[0].status).toBe("IN_PROGRESS");
  });

  it("retourne 200 avec un tableau vide si aucune progression", async () => {
    vi.mocked(prisma.progress.findMany).mockResolvedValue([]);

    const res = await request(app)
      .get("/progress")
      .set("Authorization", `Bearer ${validToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it("retourne 401 si le token est absent", async () => {
    const res = await request(app).get("/progress");

    expect(res.status).toBe(401);
    expect(prisma.progress.findMany).not.toHaveBeenCalled();
  });
});

describe("PUT /progress", () => {
  it("retourne 200 avec l'enregistrement upsert si le body est valide", async () => {
    vi.mocked(prisma.progress.upsert).mockResolvedValue({
      ...mockProgressRecord,
      status: "COMPLETED",
      id: "progress-1",
      userId: "user-1",
    } as any);

    const res = await request(app)
      .put("/progress")
      .set("Authorization", `Bearer ${validToken}`)
      .send({ chapterId: "chapter-1", status: "COMPLETED" });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("COMPLETED");
    expect(prisma.progress.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        create: expect.objectContaining({ userId: "user-1", chapterId: "chapter-1" }),
      })
    );
  });

  it("retourne 400 si le status est invalide", async () => {
    const res = await request(app)
      .put("/progress")
      .set("Authorization", `Bearer ${validToken}`)
      .send({ chapterId: "chapter-1", status: "INVALIDE" });

    expect(res.status).toBe(400);
    expect(prisma.progress.upsert).not.toHaveBeenCalled();
  });

  it("retourne 400 si chapterId est manquant", async () => {
    const res = await request(app)
      .put("/progress")
      .set("Authorization", `Bearer ${validToken}`)
      .send({ status: "COMPLETED" });

    expect(res.status).toBe(400);
    expect(prisma.progress.upsert).not.toHaveBeenCalled();
  });

  it("retourne 401 si le token est absent", async () => {
    const res = await request(app)
      .put("/progress")
      .send({ chapterId: "chapter-1", status: "COMPLETED" });

    expect(res.status).toBe(401);
    expect(prisma.progress.upsert).not.toHaveBeenCalled();
  });
});
