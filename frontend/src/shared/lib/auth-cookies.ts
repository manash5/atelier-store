// Auth cookies owned by the storefront. Both are httpOnly, so browser
// JavaScript never sees them:
// - the Better Auth session cookie (long-lived, issued by the backend and
//   re-set here on the storefront origin) proves who the visitor is and is
//   exchanged for access tokens;
// - the access token cookie holds a short-lived JWT that server code sends to
//   the backend as `Authorization: Bearer <jwt>`.
// Used by server actions and Server Components (through `next/headers`) and
// by `src/proxy.ts` (through NextRequest/NextResponse cookies).

import { decodeJwt } from "jose";
import { cookies } from "next/headers";
import { connection } from "next/server";

const isProduction = process.env.NODE_ENV === "production";

export const ACCESS_TOKEN_COOKIE = "atelier.access_token";

/** Better Auth's session cookie; `__Secure-` prefixed when served over HTTPS. */
export const SESSION_COOKIES = [
  "__Secure-better-auth.session_token",
  "better-auth.session_token",
] as const;

/** Every cookie Better Auth may set (session token, cached session data). */
const BETTER_AUTH_COOKIE = /^(__Secure-)?better-auth\./;

export type CookieOptions = {
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: "lax" | "strict" | "none";
  path?: string;
  maxAge?: number;
  expires?: Date;
};

export type ParsedCookie = { name: string; value: string; options: CookieOptions };

/** Anything with a cookie jar: `await cookies()`, `request.cookies`, `response.cookies`. */
type CookieReader = { get(name: string): { value: string } | undefined };
type CookieWriter = { set(name: string, value: string, options?: CookieOptions): unknown };

const baseOptions: CookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: "lax",
  path: "/",
};

/** Seconds until the JWT's `exp`, or 0 if it can't be read or is already expired. */
export function secondsUntilExpiry(token: string): number {
  try {
    const { exp } = decodeJwt(token);
    return exp ? Math.max(0, exp - Math.floor(Date.now() / 1000)) : 0;
  } catch {
    return 0;
  }
}

export function accessTokenCookie(token: string): ParsedCookie {
  return {
    name: ACCESS_TOKEN_COOKIE,
    value: token,
    options: { ...baseOptions, maxAge: secondsUntilExpiry(token) },
  };
}

/** Name and value of the Better Auth session cookie, if the visitor has one. */
export function readSessionCookie(jar: CookieReader): { name: string; value: string } | null {
  for (const name of SESSION_COOKIES) {
    const value = jar.get(name)?.value;
    if (value) return { name, value };
  }
  return null;
}

/** `Cookie` header value for backend calls that need the session (e.g. /api/auth/token). */
export function sessionCookieHeader(jar: CookieReader): string | null {
  const session = readSessionCookie(jar);
  return session ? `${session.name}=${session.value}` : null;
}

/**
 * Parses `Set-Cookie` headers from a Better Auth response so the storefront
 * can set the same cookies on its own origin. Only Better Auth cookies are
 * accepted, and they are always forced to be httpOnly.
 */
export function parseSetCookies(headers: string[] | string | undefined): ParsedCookie[] {
  const list = headers === undefined ? [] : Array.isArray(headers) ? headers : [headers];
  const parsed: ParsedCookie[] = [];

  for (const header of list) {
    const [pair = "", ...attributes] = header.split(";").map((part) => part.trim());
    const separator = pair.indexOf("=");
    if (separator <= 0) continue;
    const name = pair.slice(0, separator);
    if (!BETTER_AUTH_COOKIE.test(name)) continue;

    const options: CookieOptions = { ...baseOptions };
    for (const attribute of attributes) {
      const [key = "", value = ""] = attribute.split("=");
      switch (key.toLowerCase()) {
        case "max-age":
          options.maxAge = Number(value);
          break;
        case "expires":
          options.expires = new Date(value);
          break;
        case "samesite":
          options.sameSite = value.toLowerCase() as CookieOptions["sameSite"];
          break;
        case "secure":
          options.secure = true;
          break;
      }
    }
    parsed.push({ name, value: decodeURIComponent(pair.slice(separator + 1)), options });
  }
  return parsed;
}

export function writeCookies(jar: CookieWriter, list: ParsedCookie[]) {
  for (const cookie of list) jar.set(cookie.name, cookie.value, cookie.options);
}

/** Expires every auth cookie the visitor sent. */
export function clearAuthCookies(jar: CookieWriter, sent: { name: string }[]) {
  for (const { name } of sent) {
    if (name === ACCESS_TOKEN_COOKIE || BETTER_AUTH_COOKIE.test(name)) {
      jar.set(name, "", { ...baseOptions, secure: name.startsWith("__Secure-") || isProduction, maxAge: 0 });
    }
  }
}

// ---- next/headers helpers (Server Components read, Server Functions write) ----

/** The visitor's access token, if present and not yet expired. */
export async function getAccessToken(): Promise<string | null> {
  const token = (await cookies()).get(ACCESS_TOKEN_COOKIE)?.value;
  if (!token) return null;
  // The expiry check reads the clock. With Cache Components and partial
  // prefetching, cookies() alone can still be prerendered, and Next rejects
  // Date.now() there ("unstable value Date.now() while prerendering").
  // connection() defers the rest to the actual request.
  await connection();
  return secondsUntilExpiry(token) > 0 ? token : null;
}

export async function hasSessionCookie(): Promise<boolean> {
  return readSessionCookie(await cookies()) !== null;
}

export async function getSessionCookieHeader(): Promise<string | null> {
  return sessionCookieHeader(await cookies());
}

/** Server Functions only: store Better Auth cookies from a backend response. */
export async function storeBackendCookies(setCookie: string[] | string | undefined) {
  writeCookies(await cookies(), parseSetCookies(setCookie));
}

/** Server Functions only. */
export async function storeAccessToken(token: string) {
  writeCookies(await cookies(), [accessTokenCookie(token)]);
}

/** Server Functions only: signs the visitor out locally. */
export async function clearAuthCookieJar() {
  const jar = await cookies();
  clearAuthCookies(jar, jar.getAll());
}
