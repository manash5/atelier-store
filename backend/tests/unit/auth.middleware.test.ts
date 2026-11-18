import type { NextFunction, Request, Response } from "express";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import { ForbiddenError, UnauthorizedError } from "../../src/exceptions";
import { auth } from "../../src/lib/auth";
import { resetKeyCache, verifyAccessToken } from "../../src/lib/jwt";
import { authorize, authorizeAdmin } from "../../src/middleware/auth.middleware";
import type { User } from "../../src/models/user";
import { userRepository } from "../../src/repositories/user.repository";
import { createTestKeys, type TestKeys } from "../helpers/tokens";

let keys: TestKeys;
const claims = { email: "ada@example.com", name: "Ada", role: "user" };

beforeAll(async () => {
  keys = await createTestKeys();
});

beforeEach(() => {
  vi.restoreAllMocks();
  resetKeyCache();
  vi.spyOn(auth.api, "getJwks").mockResolvedValue(keys.jwks as never);
});

function requestWith(authorization?: string) {
  return { headers: authorization === undefined ? {} : { authorization } } as Request;
}

async function run(req: Request) {
  const next = vi.fn() as unknown as NextFunction;
  await authorize(req, {} as Response, next);
  return next;
}

describe("verifyAccessToken", () => {
  it("returns the claims of a valid token", async () => {
    const token = await keys.sign(claims, { subject: "user-42" });
    await expect(verifyAccessToken(token)).resolves.toEqual({ sub: "user-42", ...claims });
  });

  it.each([
    ["expired", { expiresIn: "-1m" }],
    ["wrong issuer", { issuer: "https://evil.example" }],
    ["wrong audience", { audience: "https://evil.example" }],
  ])("rejects a token with %s", async (_label, options) => {
    const token = await keys.sign(claims, options);
    await expect(verifyAccessToken(token)).resolves.toBeNull();
  });

  it("rejects a token signed by another key with the same kid", async () => {
    const other = await createTestKeys("test-key");
    await expect(verifyAccessToken(await other.sign(claims))).resolves.toBeNull();
  });

  it("rejects a token with missing claims", async () => {
    const token = await keys.sign({ name: "No email" });
    await expect(verifyAccessToken(token)).resolves.toBeNull();
  });

  it("rejects garbage", async () => {
    await expect(verifyAccessToken("not.a.jwt")).resolves.toBeNull();
  });

  it("reloads the key set when a token names an unknown key", async () => {
    await verifyAccessToken(await keys.sign(claims)); // caches the first key set
    const rotated = await createTestKeys("rotated-key");
    vi.mocked(auth.api.getJwks).mockResolvedValue(rotated.jwks as never);
    await expect(verifyAccessToken(await rotated.sign(claims))).resolves.toMatchObject(claims);
  });
});

describe("authorize", () => {
  it("rejects a request without an Authorization header", async () => {
    await expect(run(requestWith())).rejects.toThrow(
      new UnauthorizedError("Authentication required"),
    );
  });

  it.each(["Basic abc", "Bearer", "Bearer a b", "token"])(
    "rejects the malformed header %j",
    async (header) => {
      await expect(run(requestWith(header))).rejects.toThrow("Malformed authorization header");
    },
  );

  it("rejects an invalid token", async () => {
    await expect(run(requestWith("Bearer not.a.jwt"))).rejects.toThrow(
      "Invalid or expired token",
    );
  });

  it("sets req.user and calls next for a valid token", async () => {
    const req = requestWith(`Bearer ${await keys.sign(claims, { subject: "user-7" })}`);
    const next = await run(req);
    expect(next).toHaveBeenCalledOnce();
    expect(req.user).toEqual({ sub: "user-7", ...claims });
  });
});

describe("authorizeAdmin", () => {
  const dbUser = (overrides: Partial<User> = {}): User => ({
    id: "u",
    name: "Ada",
    email: "ada@example.com",
    emailVerified: true,
    image: null,
    role: "admin",
    banned: false,
    banReason: null,
    banExpires: null,
    createdAt: new Date(0),
    updatedAt: new Date(0),
    ...overrides,
  });

  async function check(user?: Request["user"]) {
    const next = vi.fn();
    await authorizeAdmin({ user } as Request, {} as Response, next);
    return next;
  }

  it("requires authorize to have run", async () => {
    await expect(check()).rejects.toBeInstanceOf(UnauthorizedError);
  });

  it("forbids non-admin tokens without touching the database", async () => {
    const findById = vi.spyOn(userRepository, "findById");
    await expect(check({ sub: "u", ...claims, role: "user" })).rejects.toBeInstanceOf(ForbiddenError);
    expect(findById).not.toHaveBeenCalled();
  });

  it("lets active admins through", async () => {
    vi.spyOn(userRepository, "findById").mockResolvedValue(dbUser());
    expect(await check({ sub: "u", ...claims, role: "admin" })).toHaveBeenCalledOnce();
  });

  it("rejects an admin token for someone demoted since it was issued", async () => {
    vi.spyOn(userRepository, "findById").mockResolvedValue(dbUser({ role: "user" }));
    await expect(check({ sub: "u", ...claims, role: "admin" })).rejects.toBeInstanceOf(ForbiddenError);
  });

  it("rejects an admin token for a suspended account", async () => {
    vi.spyOn(userRepository, "findById").mockResolvedValue(dbUser({ banned: true }));
    await expect(check({ sub: "u", ...claims, role: "admin" })).rejects.toThrow("Account is suspended");
  });

  it("rejects an admin token for a deleted account", async () => {
    vi.spyOn(userRepository, "findById").mockResolvedValue(null);
    await expect(check({ sub: "u", ...claims, role: "admin" })).rejects.toBeInstanceOf(UnauthorizedError);
  });
});
