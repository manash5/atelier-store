"use server";

import { decodeJwt } from "jose";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { isApiError } from "@/shared/api/errors";
import {
  clearAuthCookieJar,
  getSessionCookieHeader,
  storeAccessToken,
  storeBackendCookies,
} from "@/shared/lib/auth-cookies";

import {
  fetchAccessToken,
  signInEmail,
  signOutSession,
  signUpEmail,
  type AuthResult,
  type ForwardedHeaders,
} from "./api/auth.service";
import { safeRedirect } from "./lib/safe-redirect";
import type { AuthFormState } from "./types";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD = 8;
const MAX_PASSWORD = 128;

/** Origin, user agent and client IP of the visitor, for Better Auth. */
async function forwardedHeaders(): Promise<ForwardedHeaders> {
  const incoming = await headers();
  const host = incoming.get("x-forwarded-host") ?? incoming.get("host");
  const proto = incoming.get("x-forwarded-proto") ?? "http";
  return {
    origin: incoming.get("origin") ?? (host ? `${proto}://${host}` : undefined),
    userAgent: incoming.get("user-agent") ?? undefined,
    forwardedFor: incoming.get("x-forwarded-for") ?? undefined,
  };
}

function text(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

function failure(result: AuthResult, fallback: string): string {
  if (result.status === 429) return "Too many attempts. Please wait a few minutes and try again.";
  if (result.status >= 500) return "Something went wrong on our side. Please try again.";
  return result.message ?? fallback;
}

/**
 * Stores the session cookie from a successful sign-in/up and exchanges it for
 * the first access token, so the next page can call the API straight away.
 * Returns the access token's role claim (null if no token was issued).
 */
async function startSession(result: AuthResult, forwarded: ForwardedHeaders): Promise<string | null> {
  await storeBackendCookies(result.setCookie);

  const cookie = await getSessionCookieHeader();
  if (!cookie) return null;
  const token = await fetchAccessToken({ ...forwarded, cookie });
  await storeBackendCookies(token.setCookie);
  if (!token.data?.token) return null;
  await storeAccessToken(token.data.token);
  const role = decodeJwt(token.data.token).role;
  return typeof role === "string" ? role : null;
}

/**
 * Where to go after signing in: the requested page, else the admin overview
 * for admins and the account page for customers.
 */
function destination(next: FormDataEntryValue | null, role: string | null): string {
  const requested = typeof next === "string" && next ? next : null;
  if (role === "admin" && (requested === null || requested === "/account")) return "/admin";
  return safeRedirect(requested);
}

export async function signInAction(
  _previous: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const email = text(formData, "email").toLowerCase();
  const password = String(formData.get("password") ?? "");
  const values = { email };

  const fieldErrors: AuthFormState["fieldErrors"] = {};
  if (!EMAIL.test(email)) fieldErrors.email = "Enter a valid email address.";
  if (!password) fieldErrors.password = "Enter your password.";
  if (Object.keys(fieldErrors).length) return { fieldErrors, values };

  let result: AuthResult;
  const forwarded = await forwardedHeaders();
  try {
    result = await signInEmail({ email, password }, forwarded);
  } catch (error) {
    if (isApiError(error)) return { error: "We can't reach the store right now. Please try again.", values };
    throw error;
  }

  if (result.status === 401) return { error: "Incorrect email or password.", values };
  if (result.status >= 400) return { error: failure(result, "Couldn't sign you in."), values };

  const role = await startSession(result, forwarded);
  redirect(destination(formData.get("next"), role));
}

export async function signUpAction(
  _previous: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const name = text(formData, "name");
  const email = text(formData, "email").toLowerCase();
  const password = String(formData.get("password") ?? "");
  const values = { name, email };

  const fieldErrors: AuthFormState["fieldErrors"] = {};
  if (!name) fieldErrors.name = "Enter your name.";
  if (!EMAIL.test(email)) fieldErrors.email = "Enter a valid email address.";
  if (password.length < MIN_PASSWORD) {
    fieldErrors.password = `Use at least ${MIN_PASSWORD} characters.`;
  } else if (password.length > MAX_PASSWORD) {
    fieldErrors.password = `Use at most ${MAX_PASSWORD} characters.`;
  }
  if (Object.keys(fieldErrors).length) return { fieldErrors, values };

  let result: AuthResult;
  const forwarded = await forwardedHeaders();
  try {
    result = await signUpEmail({ name, email, password }, forwarded);
  } catch (error) {
    if (isApiError(error)) return { error: "We can't reach the store right now. Please try again.", values };
    throw error;
  }

  if (result.status === 422) {
    return { fieldErrors: { email: "An account with this email already exists." }, values };
  }
  if (result.status >= 400) return { error: failure(result, "Couldn't create your account."), values };

  await startSession(result, forwarded);
  redirect(safeRedirect(formData.get("next")));
}

export async function signOutAction(): Promise<void> {
  const cookie = await getSessionCookieHeader();
  if (cookie) {
    try {
      // Revokes the session in the database; local cookies are cleared regardless.
      await signOutSession({ ...(await forwardedHeaders()), cookie });
    } catch (error) {
      if (!isApiError(error)) throw error;
    }
  }
  await clearAuthCookieJar();
  redirect("/");
}
