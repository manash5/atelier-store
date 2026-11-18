import { createRemoteJWKSet, jwtVerify } from "jose";
import { NextResponse, type NextRequest } from "next/server";

import {
  ACCESS_TOKEN_COOKIE,
  accessTokenCookie,
  clearAuthCookies,
  parseSetCookies,
  readSessionCookie,
  sessionCookieHeader,
  writeCookies,
  type ParsedCookie,
} from "@/shared/lib/auth-cookies";

// Runs before every page (and the server actions posted to it):
// 1. no session cookie on a protected page → /sign-in?next=<path>;
// 2. a signed-in visitor whose access token is missing, expired or invalid →
//    exchange the session cookie for a fresh JWT at the backend
//    (GET /api/auth/token) and set it on both the response (browser) and the
//    forwarded request (this render), so the bag count and "Add to bag" work
//    on public pages too;
// 3. /admin requires role "admin" in the verified token;
// 4. signed-in visitors skip /sign-in and /sign-up (admins go to /admin, and
//    /account sends admins to /admin too).
// The backend still verifies every token: this is a UX gate, not the boundary.

const backendUrl = (process.env.BACKEND_URL ?? "").replace(/\/$/, "");

// Better Auth's public keys, fetched once and cached by jose.
const jwks = createRemoteJWKSet(new URL(`${backendUrl || "http://localhost:4000"}/api/auth/jwks`));

const AUTH_PAGES = ["/sign-in", "/sign-up"];
/** Pages that need a signed-in visitor. */
const PROTECTED_PREFIXES = ["/account", "/admin", "/bag", "/checkout", "/orders"];

function isProtected(pathname: string) {
  return PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

type Claims = { sub: string; role?: string };

async function verify(token: string | undefined): Promise<Claims | null> {
  if (!token) return null;
  try {
    // Issuer/audience are the storefront origin and are checked by the backend.
    const { payload } = await jwtVerify(token, jwks);
    return payload.sub ? { sub: payload.sub, role: payload.role as string | undefined } : null;
  } catch {
    return null;
  }
}

/** Exchanges the session cookie for a new access token. Null if the session is invalid. */
async function refresh(request: NextRequest): Promise<{ token: string; cookies: ParsedCookie[] } | null> {
  const cookie = sessionCookieHeader(request.cookies);
  if (!cookie || !backendUrl) return null;
  try {
    const response = await fetch(`${backendUrl}/api/auth/token`, {
      headers: {
        Cookie: cookie,
        Accept: "application/json",
        "User-Agent": request.headers.get("user-agent") ?? "",
        "X-Forwarded-For": request.headers.get("x-forwarded-for") ?? "",
      },
      cache: "no-store",
    });
    if (!response.ok) return null;
    const body = (await response.json()) as { token?: string };
    if (!body.token) return null;
    return { token: body.token, cookies: parseSetCookies(response.headers.getSetCookie()) };
  } catch {
    return null;
  }
}

function redirectTo(request: NextRequest, pathname: string, next?: string) {
  const url = new URL(pathname, request.url);
  if (next) url.searchParams.set("next", next);
  return NextResponse.redirect(url);
}

/** Forwards updated cookies to this render and tells the browser to store them. */
function continueWith(request: NextRequest, updated: ParsedCookie[]) {
  for (const cookie of updated) request.cookies.set(cookie.name, cookie.value);
  const response = NextResponse.next({ request: { headers: request.headers } });
  writeCookies(response.cookies, updated);
  return response;
}

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const isAuthPage = AUTH_PAGES.includes(pathname);
  const isProtectedPage = isProtected(pathname);
  const hasSession = readSessionCookie(request.cookies) !== null;

  if (!hasSession) {
    return isProtectedPage
      ? redirectTo(request, "/sign-in", pathname + search)
      : NextResponse.next();
  }

  let claims = await verify(request.cookies.get(ACCESS_TOKEN_COOKIE)?.value);
  let updated: ParsedCookie[] = [];

  if (!claims) {
    const refreshed = await refresh(request);
    if (!refreshed) {
      // Session expired or revoked: drop the stale cookies.
      const response = isProtectedPage
        ? redirectTo(request, "/sign-in", pathname + search)
        : NextResponse.next();
      clearAuthCookies(response.cookies, request.cookies.getAll());
      return response;
    }
    claims = await verify(refreshed.token);
    updated = [...refreshed.cookies, accessTokenCookie(refreshed.token)];
  }

  const isAdmin = claims?.role === "admin";
  // Signed-in visitors skip the auth pages; admins work from the admin
  // portal, so their "account" is the admin overview.
  if (isAuthPage) return redirectTo(request, isAdmin ? "/admin" : "/account");
  if (isAdmin && pathname === "/account") return redirectTo(request, "/admin");
  if (pathname.startsWith("/admin") && claims?.role !== "admin") {
    return redirectTo(request, "/account");
  }

  return updated.length ? continueWith(request, updated) : NextResponse.next();
}

export const config = {
  // Every page except Next internals, API rewrites, uploads and static files.
  matcher: ["/((?!_next/|api/|uploads/|favicon\\.ico|.*\\.[a-zA-Z0-9]+$).*)"],
};
