import { existsSync } from "node:fs";
import path from "node:path";

import request from "supertest";
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import { createApp } from "../../src/app";
import { uploadDir } from "../../src/config/uploads";
import { pool } from "../../src/database";
import { UploadDto } from "../../src/dtos/upload.dto";
import { MeDto } from "../../src/dtos/user.dto";
import { auth } from "../../src/lib/auth";
import { resetKeyCache } from "../../src/lib/jwt";
import { userRepository } from "../../src/repositories/user.repository";
import { createTestKeys, type TestKeys } from "../helpers/tokens";

const app = createApp();
const hasDatabase = Boolean(process.env.TEST_DATABASE_URL);

// Smallest valid PNG (1×1 transparent pixel).
const PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=",
  "base64",
);

afterAll(async () => {
  vi.restoreAllMocks();
  await pool.end();
});

describe("protected routes (signed test tokens, no database)", () => {
  let keys: TestKeys;
  let userToken: string;
  let adminToken: string;

  beforeAll(async () => {
    keys = await createTestKeys();
    userToken = await keys.sign(
      { email: "ada@example.com", name: "Ada", role: "user" },
      { subject: "user-1" },
    );
    adminToken = await keys.sign(
      { email: "admin@example.com", name: "Admin", role: "admin" },
      { subject: "admin-1" },
    );
  });

  beforeEach(() => {
    vi.restoreAllMocks();
    resetKeyCache();
    vi.spyOn(auth.api, "getJwks").mockResolvedValue(keys.jwks as never);
  });

  describe("GET /api/v1/me", () => {
    it("returns 401 without a token", async () => {
      const res = await request(app).get("/api/v1/me");
      expect(res.status).toBe(401);
      expect(res.body).toEqual({
        error: { code: "UNAUTHORIZED", message: "Authentication required" },
      });
    });

    it("returns 401 for a malformed header", async () => {
      const res = await request(app).get("/api/v1/me").set("Authorization", "Token abc");
      expect(res.status).toBe(401);
      expect(res.body.error.message).toBe("Malformed authorization header");
    });

    it("returns 401 for an invalid token", async () => {
      const res = await request(app).get("/api/v1/me").set("Authorization", "Bearer x.y.z");
      expect(res.status).toBe(401);
      expect(res.body.error.message).toBe("Invalid or expired token");
    });

    it("returns the signed-in user", async () => {
      vi.spyOn(userRepository, "findById").mockResolvedValue({
        id: "user-1",
        name: "Ada",
        email: "ada@example.com",
        emailVerified: false,
        image: null,
        role: null,
        banned: false,
        banReason: null,
        banExpires: null,
        createdAt: new Date("2026-01-01T00:00:00Z"),
        updatedAt: new Date("2026-01-01T00:00:00Z"),
      });
      const res = await request(app)
        .get("/api/v1/me")
        .set("Authorization", `Bearer ${userToken}`);
      expect(res.status).toBe(200);
      expect(MeDto.parse(res.body.data)).toMatchObject({ id: "user-1", role: "user" });
      expect(userRepository.findById).toHaveBeenCalledWith("user-1");
    });

    it("returns 401 when the account no longer exists", async () => {
      vi.spyOn(userRepository, "findById").mockResolvedValue(null);
      const res = await request(app)
        .get("/api/v1/me")
        .set("Authorization", `Bearer ${userToken}`);
      expect(res.status).toBe(401);
    });
  });

  describe("POST /api/v1/admin/uploads", () => {
    const upload = () => request(app).post("/api/v1/admin/uploads");

    it("returns 401 without a token", async () => {
      const res = await upload().attach("image", PNG, {
        filename: "a.png",
        contentType: "image/png",
      });
      expect(res.status).toBe(401);
    });

    it("returns 403 for a customer", async () => {
      const res = await upload()
        .set("Authorization", `Bearer ${userToken}`)
        .attach("image", PNG, { filename: "a.png", contentType: "image/png" });
      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe("FORBIDDEN");
    });

    it("stores an image under a random name and serves it", async () => {
      const res = await upload()
        .set("Authorization", `Bearer ${adminToken}`)
        .attach("image", PNG, { filename: "../../evil.png", contentType: "image/png" });
      expect(res.status).toBe(201);
      const stored = UploadDto.parse(res.body.data);
      expect(stored.filename).toMatch(/^[0-9a-f-]{36}\.png$/);
      expect(stored).toMatchObject({ size: PNG.length, mimeType: "image/png" });
      expect(existsSync(path.join(uploadDir, stored.filename))).toBe(true);

      const file = await request(app).get(stored.url);
      expect(file.status).toBe(200);
      expect(file.headers["content-type"]).toBe("image/png");
    });

    it("rejects a non-image file", async () => {
      const res = await upload()
        .set("Authorization", `Bearer ${adminToken}`)
        .attach("image", Buffer.from("hello"), { filename: "a.txt", contentType: "text/plain" });
      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe("VALIDATION_ERROR");
    });

    it("rejects a file over 5 MB", async () => {
      const res = await upload()
        .set("Authorization", `Bearer ${adminToken}`)
        .attach("image", Buffer.alloc(5 * 1024 * 1024 + 1), {
          filename: "big.png",
          contentType: "image/png",
        });
      expect(res.status).toBe(400);
      expect(res.body.error.message).toBe("File is larger than 5 MB");
    });

    it("rejects the wrong field name", async () => {
      const res = await upload()
        .set("Authorization", `Bearer ${adminToken}`)
        .attach("file", PNG, { filename: "a.png", contentType: "image/png" });
      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe("VALIDATION_ERROR");
    });

    it("rejects a request without a file", async () => {
      const res = await upload()
        .set("Authorization", `Bearer ${adminToken}`)
        .field("note", "no file");
      expect(res.status).toBe(400);
      expect(res.body.error.message).toBe("No image was uploaded");
    });
  });
});

describe("cart and order routes (no database)", () => {
  it.each([
    ["get", "/api/v1/cart"],
    ["get", "/api/v1/cart/count"],
    ["post", "/api/v1/cart/items"],
    ["patch", "/api/v1/cart/items/silk-scarf"],
    ["delete", "/api/v1/cart/items/silk-scarf"],
    ["get", "/api/v1/orders"],
    ["post", "/api/v1/orders"],
    ["get", "/api/v1/orders/AT-ABCDEFGH"],
  ] as const)("%s %s requires a token", async (method, path) => {
    const res = await request(app)[method](path);
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe("UNAUTHORIZED");
  });

  describe("with a token", () => {
    let token: string;

    beforeAll(async () => {
      const keys = await createTestKeys();
      token = await keys.sign({ email: "ada@example.com", name: "Ada", role: "user" });
      resetKeyCache();
      vi.spyOn(auth.api, "getJwks").mockResolvedValue(keys.jwks as never);
    });

    it.each([
      ["a quantity above 10", { productSlug: "silk-scarf", quantity: 11 }],
      ["a zero quantity", { productSlug: "silk-scarf", quantity: 0 }],
      ["a malformed slug", { productSlug: "Not A Slug" }],
    ])("rejects adding %s", async (_label, body) => {
      const res = await request(app)
        .post("/api/v1/cart/items")
        .set("Authorization", `Bearer ${token}`)
        .send(body);
      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe("VALIDATION_ERROR");
    });

    it("rejects an order without a valid address and card digits", async () => {
      const res = await request(app)
        .post("/api/v1/orders")
        .set("Authorization", `Bearer ${token}`)
        .send({ shippingAddress: { fullName: "" }, payment: { cardLast4: "42" } });
      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe("VALIDATION_ERROR");
    });

    it("rejects a malformed order number", async () => {
      const res = await request(app)
        .get("/api/v1/orders/123")
        .set("Authorization", `Bearer ${token}`);
      expect(res.status).toBe(400);
    });
  });
});

describe.skipIf(!hasDatabase)("Better Auth → JWT → API (database)", () => {
  const email = `test-${Date.now()}@example.com`;
  const password = "correct horse battery";

  beforeAll(() => {
    vi.restoreAllMocks();
    resetKeyCache();
  });

  it("signs up, exchanges the session for a JWT and calls /me", async () => {
    const signUp = await request(app)
      .post("/api/auth/sign-up/email")
      .set("Origin", "http://localhost:3000")
      .send({ email, password, name: "Test User" });
    expect(signUp.status).toBe(200);
    const cookies = signUp.headers["set-cookie"] as unknown as string[];
    expect(cookies.some((cookie) => cookie.includes("session_token"))).toBe(true);

    const tokenRes = await request(app)
      .get("/api/auth/token")
      .set("Cookie", cookies.map((cookie) => cookie.split(";")[0]).join("; "));
    expect(tokenRes.status).toBe(200);
    const token = tokenRes.body.token as string;

    const me = await request(app).get("/api/v1/me").set("Authorization", `Bearer ${token}`);
    expect(me.status).toBe(200);
    expect(me.body.data).toMatchObject({ email, role: "user" });

    const upload = await request(app)
      .post("/api/v1/admin/uploads")
      .set("Authorization", `Bearer ${token}`)
      .attach("image", PNG, { filename: "a.png", contentType: "image/png" });
    expect(upload.status).toBe(403);
  });

  it("rejects a wrong password", async () => {
    const res = await request(app)
      .post("/api/auth/sign-in/email")
      .set("Origin", "http://localhost:3000")
      .send({ email, password: "wrong password!" });
    expect(res.status).toBe(401);
  });
});
