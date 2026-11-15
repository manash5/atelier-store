import { createApp } from "./app";
import { env } from "./config/env";
import { pool } from "./database";
import { logger } from "./lib/logger";

const server = createApp().listen(env.PORT, () => {
  logger.info(`API listening on http://localhost:${env.PORT}`);
});

function shutdown(signal: string) {
  logger.info(`${signal} received, shutting down`);
  server.close(() => {
    pool
      .end()
      .catch((error: unknown) => logger.error({ err: error }, "Error closing database pool"))
      .finally(() => process.exit(0));
  });
  // Force exit if open connections don't drain in time.
  setTimeout(() => process.exit(1), 10_000).unref();
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
