import type { CorsOptions } from "cors";

import { env } from "./env";

// Browsers normally reach the API through the storefront's same-origin
// rewrites, so CORS only matters for direct calls (local tools, other origins).
export const corsOptions: CorsOptions = {
  origin: env.CORS_ORIGINS,
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  maxAge: 600,
};
