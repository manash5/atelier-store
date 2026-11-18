import { toNodeHandler } from "better-auth/node";
import cors from "cors";
import express from "express";
import helmet from "helmet";

import { corsOptions } from "./config/cors";
import { env } from "./config/env";
import { ensureUploadDir, uploadDir, UPLOADS_URL_PREFIX } from "./config/uploads";
import { auth } from "./lib/auth";
import { errorHandler } from "./middleware/error-handler";
import { notFound } from "./middleware/not-found";
import { authRateLimit } from "./middleware/rate-limit";
import { requestLogger } from "./middleware/request-logger";
import { apiRouter, healthRouter } from "./routes";

/** Builds the Express app. `server.ts` owns listening and shutdown. */
export function createApp() {
  const app = express();

  app.disable("x-powered-by");
  app.set("trust proxy", env.TRUST_PROXY);

  app.use(requestLogger);
  app.use(helmet());
  app.use(cors(corsOptions));

  // Better Auth parses its own bodies: mount it before express.json().
  app.use("/api/auth", authRateLimit);
  // Better Auth's admin plugin endpoints (impersonation, password resets,
  // user deletion, role changes) are not used: admin features live under
  // /api/v1/admin. Block them so a stolen admin cookie can't reach them.
  app.use("/api/auth/admin", notFound);
  app.all("/api/auth/*splat", toNodeHandler(auth));

  app.use(express.json({ limit: "100kb" }));

  // Uploaded images. Names are random UUIDs, so they can be cached forever.
  ensureUploadDir();
  app.use(
    UPLOADS_URL_PREFIX,
    express.static(uploadDir, { immutable: true, maxAge: "365d", index: false, dotfiles: "deny" }),
  );

  app.use("/health", healthRouter);
  app.use("/api/v1", apiRouter);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
