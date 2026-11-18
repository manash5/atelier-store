import { exportJWK, generateKeyPair, SignJWT, type JSONWebKeySet, type JWK } from "jose";

const ISSUER = "http://localhost:3000";

interface SignOptions {
  subject?: string;
  expiresIn?: string | number;
  issuer?: string;
  audience?: string;
}

export interface TestKeys {
  jwks: JSONWebKeySet;
  sign: (claims: Record<string, unknown>, options?: SignOptions) => Promise<string>;
}

/** An Ed25519 key pair shaped like Better Auth's JWKS, plus a signer for test tokens. */
export async function createTestKeys(kid = "test-key"): Promise<TestKeys> {
  const { publicKey, privateKey } = await generateKeyPair("EdDSA", { extractable: true });
  const jwk: JWK = { ...(await exportJWK(publicKey)), kid, alg: "EdDSA" };

  return {
    jwks: { keys: [jwk] },
    sign: (claims, options = {}) =>
      new SignJWT(claims)
        .setProtectedHeader({ alg: "EdDSA", kid })
        .setSubject(options.subject ?? "user-1")
        .setIssuer(options.issuer ?? ISSUER)
        .setAudience(options.audience ?? ISSUER)
        .setIssuedAt()
        .setExpirationTime(options.expiresIn ?? "15m")
        .sign(privateKey),
  };
}
