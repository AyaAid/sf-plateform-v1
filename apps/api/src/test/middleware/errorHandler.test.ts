import { describe, it, expect } from "vitest";
import request from "supertest";
import express from "express";
import { errorHandler } from "../../middleware/errorHandler";

// App minimale avec une route qui throw intentionnellement
const app = express();
app.get("/boom", () => {
  throw new Error("Unexpected crash");
});
app.use(errorHandler);

describe("middleware errorHandler", () => {
  it("retourne 500 avec un message générique si une route throw", async () => {
    const res = await request(app).get("/boom");

    expect(res.status).toBe(500);
    expect(res.body.error).toBe("Internal server error");
  });

  it("ne pas affecter les réponses normales des autres routes", async () => {
    const appNormal = express();
    appNormal.get("/ok", (_req, res) => res.json({ ok: true }));
    appNormal.use(errorHandler);

    const res = await request(appNormal).get("/ok");

    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
  });
});
