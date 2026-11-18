import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin, jwt } from "better-auth/plugins";

import { env, isProduction } from "../config/env";
import { db } from "../database";
import * as schema from "../database/schema";

/** Lifetime of the JWT access tokens issued by GET /api/auth/token. */
export const ACCESS_TOKEN_TTL = "15m";

// Mounted at /api/auth/* in app.ts. Browsers reach it through the storefront's
// same-origin rewrites, so `baseURL` is the storefront origin and session
// cookies are first-party (httpOnly, SameSite=Lax by default).
//
// The session cookie only authenticates /api/auth/* calls. Everything under
// /api/v1 is authorized with a short-lived JWT (`Authorization: Bearer ...`)
// minted by the jwt plugin and verified by middleware/auth.middleware.ts.
export const auth = betterAuth({
  appName: "Atelier",
  baseURL: env.BETTER_AUTH_URL,
  secret: env.BETTER_AUTH_SECRET,
  trustedOrigins: [...new Set([env.BETTER_AUTH_URL, ...env.CORS_ORIGINS])],
  database: drizzleAdapter(db, { provider: "pg", schema }),
  advanced: {
    useSecureCookies: isProduction,
  },
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    maxPasswordLength: 128,
    autoSignIn: true,
  },
  plugins: [
    jwt({
      jwt: {
        issuer: env.BETTER_AUTH_URL,
        audience: env.BETTER_AUTH_URL,
        expirationTime: ACCESS_TOKEN_TTL,
        definePayload: ({ user }) => ({
          email: user.email,
          name: user.name,
          role: user.role ?? "user",
        }),
      },
    }),
    // Adds `role` (default "user") and ban fields to users.
    admin(),
  ],
});

export type Session = typeof auth.$Infer.Session;
