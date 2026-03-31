import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";

vi.mock("../../db/prisma", () => ({
  prisma: {
    chapter: {
      findUnique: vi.fn(),
    },
  },
}));

vi.mock("fs/promises", () => ({
  default: {
    readFile: vi.fn(),
  },
}));

import { buildApp, mockChapter } from "../helpers";
import { prisma } from "../../db/prisma";
import fs from "fs/promises";

const app = buildApp();

beforeEach(() => {
  vi.clearAllMocks();
});

describe("GET /chapters/:id", () => {
  it("retourne 200 avec le chapitre et le markdown si tout existe", async () => {
    vi.mocked(prisma.chapter.findUnique).mockResolvedValue(mockChapter as any);
    vi.mocked(fs.readFile).mockResolvedValue("# Bienvenue\n\nContenu du chapitre." as any);

    const res = await request(app).get("/chapters/chapter-1");

    expect(res.status).toBe(200);
    expect(res.body.chapter.id).toBe("chapter-1");
    expect(res.body.markdown).toBe("# Bienvenue\n\nContenu du chapitre.");
  });

  it("retourne 404 si le chapitre n'existe pas en base", async () => {
    vi.mocked(prisma.chapter.findUnique).mockResolvedValue(null);

    const res = await request(app).get("/chapters/inexistant");

    expect(res.status).toBe(404);
    expect(res.body.error).toBe("Chapter not found");
    expect(fs.readFile).not.toHaveBeenCalled();
  });

  it("retourne 500 si le fichier markdown est introuvable", async () => {
    vi.mocked(prisma.chapter.findUnique).mockResolvedValue(mockChapter as any);
    vi.mocked(fs.readFile).mockRejectedValue(new Error("ENOENT: no such file"));

    const res = await request(app).get("/chapters/chapter-1");

    expect(res.status).toBe(500);
    expect(res.body.error).toBe("Markdown file not found");
    expect(res.body.mdPath).toBe(mockChapter.mdPath);
  });
});
