import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import express from "express";
import jwt from "jsonwebtoken";
import { requireAuth, AuthRequest } from "../../middleware/requireAuth";

const SECRET = "test-secret";
process.env.JWT_SECRET = SECRET;

// App minimale avec une route protégée
const app = express();
app.use(express.json());
app.get("/protected", requireAuth, (req: AuthRequest, res) => {
  res.json({ userId: req.userId });
});

function signToken(userId: string, options?: jwt.SignOptions) {
  return jwt.sign({ userId }, SECRET, options);
}

describe("middleware requireAuth", () => {
  it("appelle next() et injecte userId si le token est valide", async () => {
    const token = signToken("user-1", { expiresIn: "1h" });

    const res = await request(app)
      .get("/protected")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.userId).toBe("user-1");
  });

  it("retourne 401 si le header Authorization est absent", async () => {
    const res = await request(app).get("/protected");

    expect(res.status).toBe(401);
    expect(res.body.error).toBe("Missing or invalid Authorization header");
  });

  it("retourne 401 si le header ne commence pas par 'Bearer '", async () => {
    const res = await request(app)
      .get("/protected")
      .set("Authorization", "Basic abc123");

    expect(res.status).toBe(401);
    expect(res.body.error).toBe("Missing or invalid Authorization header");
  });

  it("retourne 401 si le token est expiré", async () => {
    const token = signToken("user-1", { expiresIn: "0s" });

    const res = await request(app)
      .get("/protected")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(401);
    expect(res.body.error).toBe("Invalid or expired token");
  });

  it("retourne 401 si le token a une signature invalide", async () => {
    const token = jwt.sign({ userId: "user-1" }, "mauvais-secret");

    const res = await request(app)
      .get("/protected")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(401);
    expect(res.body.error).toBe("Invalid or expired token");
  });
});
