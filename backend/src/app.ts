import { toNodeHandler } from "better-auth/node";
import cors from "cors";
import express from "express";
import helmet from "helmet";

import { corsOptions } from "./config/cors";
import { env } from "./config/env";
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
  app.all("/api/auth/*splat", toNodeHandler(auth));

  app.use(express.json({ limit: "100kb" }));

  app.use("/health", healthRouter);
  app.use("/api/v1", apiRouter);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
