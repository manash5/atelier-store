import "server-only";

import { headers } from "next/headers";

import { authApi } from "@/shared/api/server-client";

export type Session = {
  user: { id: string; name: string; email: string; image?: string | null };
  session: { id: string; expiresAt: string };
};

/**
 * The current visitor's session, read on the server by forwarding their
 * cookies to the backend. Request-specific: never call inside `'use cache'`,
 * and render the caller inside a <Suspense> boundary.
 */
export async function getSession(): Promise<Session | null> {
  const cookie = (await headers()).get("cookie");
  if (!cookie) return null;

  const { data } = await authApi.get<Session | null>("/get-session", {
    headers: { cookie },
  });
  return data ?? null;
}
