import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { prisma } from "./lib/prisma.js";

const app = createApp();

const server = app.listen(env.PORT, () => {
  console.log(`API listening on port ${env.PORT}`);
});

const shutdown = async (signal: string) => {
  console.log(`Received ${signal}, shutting down gracefully...`);
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
};

["SIGINT", "SIGTERM"].forEach((signal) => {
  process.on(signal, () => {
    void shutdown(signal);
  });
});
