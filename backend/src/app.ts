import "express-async-errors";

import type { Request, Response } from "express";
import express from "express";
import cors from "cors";
import helmet from "helmet";

import apiRouter from "./routes/index.js";
import { errorHandler } from "./middleware/errorHandler.js";

export const createApp = () => {
  const app = express();

  app.use(helmet());
  app.use(
    cors({
      origin: process.env.FRONTEND_URL || "*",
      credentials: true,
    })
  );
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true }));

  app.use("/api", apiRouter);

  app.get("/health", (_req: Request, res: Response) => {
    res.json({ status: "ok" });
  });

  app.use(errorHandler);

  return app;
};

export type AppInstance = ReturnType<typeof createApp>;
