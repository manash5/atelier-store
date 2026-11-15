import "server-only";

import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";

import { db } from "@/db";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
  }),
  // Auth methods (email/password, social providers, etc.) are configured here later.
  plugins: [nextCookies()], // must remain the last plugin
});

export type Session = typeof auth.$Infer.Session;
