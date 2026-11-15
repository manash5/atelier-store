import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";

import { env, isProduction } from "../config/env";
import { db } from "../database";
import * as schema from "../database/schema";

// Mounted at /api/auth/* in app.ts. Browsers reach it through the storefront's
// same-origin rewrites, so `baseURL` is the storefront origin and session
// cookies are first-party (httpOnly, SameSite=Lax by default).
export const auth = betterAuth({
  appName: "Atelier",
  baseURL: env.BETTER_AUTH_URL,
  secret: env.BETTER_AUTH_SECRET,
  trustedOrigins: [...new Set([env.BETTER_AUTH_URL, ...env.CORS_ORIGINS])],
  database: drizzleAdapter(db, { provider: "pg", schema }),
  advanced: {
    useSecureCookies: isProduction,
  },
  // Auth methods (email/password, social providers, etc.) are configured here later.
});

export type Session = typeof auth.$Infer.Session;
