import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";

vi.mock("../../db/prisma", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
  },
}));

vi.mock("bcryptjs", () => ({
  default: {
    hash: vi.fn().mockResolvedValue("hashed-password"),
    compare: vi.fn(),
  },
}));

process.env.JWT_SECRET = "test-secret";

import { buildApp, mockUser, mockUserPublic } from "../helpers";
import { prisma } from "../../db/prisma";
import bcrypt from "bcryptjs";

const app = buildApp();

beforeEach(() => {
  vi.clearAllMocks();
});

describe("POST /auth/register", () => {
  it("retourne 201 avec token et user si les données sont valides", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
    vi.mocked(prisma.user.create).mockResolvedValue(mockUserPublic as any);

    const res = await request(app).post("/auth/register").send({
      email: "test@example.com",
      password: "password123",
      name: "Test User",
    });

    expect(res.status).toBe(201);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe("test@example.com");
    expect(res.body.user).not.toHaveProperty("passwordHash");
  });

  it("retourne 409 si l'email est déjà utilisé", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({ ...mockUser, passwordHash: "hash" });

    const res = await request(app).post("/auth/register").send({
      email: "test@example.com",
      password: "password123",
    });

    expect(res.status).toBe(409);
    expect(res.body.error).toBe("Email already in use");
    expect(prisma.user.create).not.toHaveBeenCalled();
  });

  it("retourne 400 si l'email est invalide", async () => {
    const res = await request(app).post("/auth/register").send({
      email: "pas-un-email",
      password: "password123",
    });

    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
    expect(prisma.user.findUnique).not.toHaveBeenCalled();
  });

  it("retourne 400 si le mot de passe fait moins de 8 caractères", async () => {
    const res = await request(app).post("/auth/register").send({
      email: "test@example.com",
      password: "court",
    });

    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
    expect(prisma.user.findUnique).not.toHaveBeenCalled();
  });

  it("retourne 400 si le body est vide", async () => {
    const res = await request(app).post("/auth/register").send({});

    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });
});

describe("POST /auth/login", () => {
  it("retourne 200 avec token et user si les identifiants sont valides", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({ ...mockUser, passwordHash: "hashed" });
    vi.mocked(bcrypt.compare).mockResolvedValue(true as never);

    const res = await request(app).post("/auth/login").send({
      email: "test@example.com",
      password: "password123",
    });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe("test@example.com");
    expect(res.body.user).not.toHaveProperty("passwordHash");
  });

  it("retourne 401 si l'email est inconnu", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

    const res = await request(app).post("/auth/login").send({
      email: "inconnu@example.com",
      password: "password123",
    });

    expect(res.status).toBe(401);
    expect(res.body.error).toBe("Invalid credentials");
  });

  it("retourne 401 si le mot de passe est incorrect", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({ ...mockUser, passwordHash: "hashed" });
    vi.mocked(bcrypt.compare).mockResolvedValue(false as never);

    const res = await request(app).post("/auth/login").send({
      email: "test@example.com",
      password: "mauvais-mdp",
    });

    expect(res.status).toBe(401);
    expect(res.body.error).toBe("Invalid credentials");
  });

  it("retourne 400 si l'email est invalide", async () => {
    const res = await request(app).post("/auth/login").send({
      email: "pas-un-email",
      password: "password123",
    });

    expect(res.status).toBe(400);
    expect(prisma.user.findUnique).not.toHaveBeenCalled();
  });

  it("retourne 400 si le body est vide", async () => {
    const res = await request(app).post("/auth/login").send({});

    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });
});
