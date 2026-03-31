import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import { authRouter } from "./routes/auth";
import { chaptersRouter } from "./routes/chapters";
import { coursesRouter } from "./routes/courses";
import { progressRouter } from "./routes/progress";
import { errorHandler } from "./middleware/errorHandler";

dotenv.config();

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

app.get("/health", (_req, res) => res.json({ ok: true, service: "api" }));

app.use("/auth", authRouter);
app.use("/courses", coursesRouter);
app.use("/chapters", chaptersRouter);
app.use("/progress", progressRouter);
app.use(errorHandler);

const port = Number(process.env.PORT || 3001);
app.listen(port, () => console.log(`API running on http://localhost:${port}`));
