import type { ErrorRequestHandler } from "express";

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  const status = err.status ?? 500;
  const message = err.message ?? "Unexpected server error";

  if (status >= 500) {
    console.error("Unhandled error", err);
  }

  res.status(status).json({ message });
};
