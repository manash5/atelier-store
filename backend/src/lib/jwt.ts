import { createLocalJWKSet, errors, jwtVerify, type JSONWebKeySet } from "jose";

import { env } from "../config/env";
import { AccessTokenPayload } from "../dtos/auth.dto";
import { auth } from "./auth";

type KeySet = ReturnType<typeof createLocalJWKSet>;

// Public keys come straight from Better Auth's `jwks` table (no HTTP round
// trip). They are cached and reloaded when a token names an unknown key, which
// happens once after the first key is created or a key is rotated.
let cachedKeySet: KeySet | undefined;

async function loadKeySet(): Promise<KeySet> {
  const jwks = (await auth.api.getJwks()) as JSONWebKeySet;
  cachedKeySet = createLocalJWKSet(jwks);
  return cachedKeySet;
}

async function verifyWith(keySet: KeySet, token: string) {
  const { payload } = await jwtVerify(token, keySet, {
    issuer: env.BETTER_AUTH_URL,
    audience: env.BETTER_AUTH_URL,
  });
  return payload;
}

/**
 * Verifies an access token's signature, issuer, audience and expiry, then
 * validates its claims. Returns null for any invalid token.
 */
export async function verifyAccessToken(token: string): Promise<AccessTokenPayload | null> {
  try {
    let payload;
    try {
      payload = await verifyWith(cachedKeySet ?? (await loadKeySet()), token);
    } catch (error) {
      if (!(error instanceof errors.JWKSNoMatchingKey)) throw error;
      payload = await verifyWith(await loadKeySet(), token);
    }
    const claims = AccessTokenPayload.safeParse(payload);
    return claims.success ? claims.data : null;
  } catch (error) {
    if (error instanceof errors.JOSEError) return null;
    throw error;
  }
}

/** Test helper: forget cached keys. */
export function resetKeyCache() {
  cachedKeySet = undefined;
}
