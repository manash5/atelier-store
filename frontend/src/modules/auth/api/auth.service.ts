import "server-only";

import { authApi } from "@/shared/api/server-client";

// Better Auth endpoints. Its error bodies are `{ code, message }` (not the
// /api/v1 envelope), so responses are returned as-is instead of throwing.

export type AuthResult<T = unknown> = {
  status: number;
  data: T | null;
  /** Better Auth's error message, when status >= 400. */
  message: string | null;
  setCookie: string[] | undefined;
};

/** Headers that let Better Auth check the origin and attribute the session. */
export type ForwardedHeaders = {
  origin?: string;
  userAgent?: string;
  forwardedFor?: string;
  cookie?: string;
};

function toHeaders(forwarded: ForwardedHeaders) {
  return {
    ...(forwarded.origin ? { Origin: forwarded.origin } : {}),
    ...(forwarded.userAgent ? { "User-Agent": forwarded.userAgent } : {}),
    ...(forwarded.forwardedFor ? { "X-Forwarded-For": forwarded.forwardedFor } : {}),
    ...(forwarded.cookie ? { Cookie: forwarded.cookie } : {}),
  };
}

async function call<T>(
  method: "get" | "post",
  url: string,
  forwarded: ForwardedHeaders,
  body?: unknown,
): Promise<AuthResult<T>> {
  const response = await authApi.request({
    method,
    url,
    data: body,
    headers: toHeaders(forwarded),
    validateStatus: () => true,
  });
  const ok = response.status < 400;
  const message =
    !ok && typeof response.data?.message === "string" ? (response.data.message as string) : null;
  return {
    status: response.status,
    data: ok ? (response.data as T) : null,
    message,
    setCookie: response.headers["set-cookie"],
  };
}

export function signInEmail(
  body: { email: string; password: string },
  forwarded: ForwardedHeaders,
) {
  return call("post", "/sign-in/email", forwarded, { ...body, rememberMe: true });
}

export function signUpEmail(
  body: { name: string; email: string; password: string },
  forwarded: ForwardedHeaders,
) {
  return call("post", "/sign-up/email", forwarded, body);
}

export function signOutSession(forwarded: ForwardedHeaders) {
  return call("post", "/sign-out", forwarded, {});
}

/** Exchanges a session cookie for a short-lived JWT access token. */
export function fetchAccessToken(forwarded: ForwardedHeaders) {
  return call<{ token: string }>("get", "/token", forwarded);
}
