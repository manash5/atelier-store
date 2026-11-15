import request from "supertest";
import { afterAll, describe, expect, it } from "vitest";

import { createApp } from "../../src/app";
import { pool } from "../../src/database";
import { CategoryDto } from "../../src/dtos/category.dto";
import { PaginationMeta } from "../../src/dtos/common.dto";
import { ProductDto } from "../../src/dtos/product.dto";

const app = createApp();
const hasDatabase = Boolean(process.env.TEST_DATABASE_URL);

afterAll(async () => {
  await pool.end();
});

describe("API without database", () => {
  it("returns the error envelope for unknown routes", async () => {
    const res = await request(app).get("/api/v1/nope");
    expect(res.status).toBe(404);
    expect(res.body).toEqual({
      error: { code: "NOT_FOUND", message: "Route GET /api/v1/nope not found" },
    });
  });

  it("rejects an invalid slug with 400 VALIDATION_ERROR", async () => {
    const res = await request(app).get("/api/v1/products/Not_A_Slug");
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
  });

  it("rejects an out-of-range limit", async () => {
    const res = await request(app).get("/api/v1/products?limit=1000");
    expect(res.status).toBe(400);
  });
});

// Requires TEST_DATABASE_URL pointing at a migrated and seeded database.
describe.skipIf(!hasDatabase)("catalog API (seeded database)", () => {
  it("GET /health pings the database", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ data: { status: "ok", database: "ok" } });
  });

  it("GET /products/:slug returns the product DTO", async () => {
    const res = await request(app).get("/api/v1/products/leather-biker-jacket");
    expect(res.status).toBe(200);
    expect(ProductDto.safeParse(res.body.data).success).toBe(true);
    expect(res.body.data).toMatchObject({
      slug: "leather-biker-jacket",
      category: { slug: "ready-to-wear", title: "Ready-to-Wear" },
      price: { amount: 490000, currency: "USD" },
      stock: 0,
      stockStatus: "sold-out",
      badge: null,
    });
  });

  it("GET /products/:slug returns 404 for unknown products", async () => {
    const res = await request(app).get("/api/v1/products/does-not-exist");
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe("NOT_FOUND");
  });

  it("GET /products?slugs keeps the requested order", async () => {
    const res = await request(app).get(
      "/api/v1/products?slugs=sapphire-drop-earrings,cotton-poplin-shirt",
    );
    expect(res.status).toBe(200);
    expect(res.body.data.map((p: { slug: string }) => p.slug)).toEqual([
      "sapphire-drop-earrings",
      "cotton-poplin-shirt",
    ]);
    expect(res.body.data[0].stockStatus).toBe("low-stock");
  });

  it("GET /products pages through the catalog", async () => {
    const res = await request(app).get("/api/v1/products?page=1&limit=5");
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(5);
    expect(res.body.meta).toEqual({ page: 1, limit: 5, total: 12 });
    expect(PaginationMeta.safeParse(res.body.meta).success).toBe(true);
    for (const product of res.body.data) {
      expect(ProductDto.safeParse(product).success).toBe(true);
    }
  });

  it("GET /products/:slug/related puts the same category first", async () => {
    const res = await request(app).get("/api/v1/products/double-monk-strap-shoe/related");
    expect(res.status).toBe(200);
    expect(res.body.data.map((p: { slug: string }) => p.slug)).toEqual([
      "suede-wingtip-brogue",
      "floral-satin-pumps",
      "fringed-cotton-knit-poncho",
      "silk-blend-bomber-jacket",
    ]);
  });

  it("GET /categories lists categories in display order", async () => {
    const res = await request(app).get("/api/v1/categories");
    expect(res.status).toBe(200);
    expect(res.body.data.map((c: { slug: string }) => c.slug)).toEqual([
      "ready-to-wear",
      "shoes",
      "bags",
      "jewelry",
      "eyewear",
    ]);
    expect(res.body.data[2].image).toBeNull();
    for (const category of res.body.data) {
      expect(CategoryDto.safeParse(category).success).toBe(true);
    }
  });
});
