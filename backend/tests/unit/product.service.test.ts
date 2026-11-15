import { beforeEach, describe, expect, it, vi } from "vitest";

import { NotFoundError } from "../../src/exceptions";
import type { Product } from "../../src/models/product";
import { deriveStockStatus } from "../../src/models/product";
import { productRepository } from "../../src/repositories/product.repository";
import { productService } from "../../src/services/product.service";

vi.mock("../../src/repositories/product.repository", () => ({
  productRepository: {
    findBySlug: vi.fn(),
    findBySlugs: vi.fn(),
    findPage: vi.fn(),
    count: vi.fn(),
    findOthersPreferringCategory: vi.fn(),
  },
}));

const repo = vi.mocked(productRepository);

function product(slug: string, overrides: Partial<Product> = {}): Product {
  return {
    id: 1,
    slug,
    categoryId: 1,
    name: slug,
    styleNumber: slug.toUpperCase(),
    price: 100_00,
    currency: "USD",
    colorName: "Black",
    colorHex: "#000000",
    stock: 5,
    description: "",
    details: [],
    images: [{ src: "https://example.com/a.jpg", alt: "" }],
    badge: null,
    createdAt: new Date(0),
    updatedAt: new Date(0),
    category: { slug: "shoes", title: "Shoes" },
    ...overrides,
  };
}

beforeEach(() => {
  vi.resetAllMocks();
});

describe("deriveStockStatus", () => {
  it.each([
    [0, "sold-out"],
    [-1, "sold-out"],
    [1, "low-stock"],
    [3, "low-stock"],
    [4, "in-stock"],
  ] as const)("stock %i → %s", (stock, status) => {
    expect(deriveStockStatus(stock)).toBe(status);
  });
});

describe("productService.getBySlug", () => {
  it("throws NotFoundError for an unknown slug", async () => {
    repo.findBySlug.mockResolvedValue(null);
    await expect(productService.getBySlug("missing")).rejects.toBeInstanceOf(NotFoundError);
  });
});

describe("productService.listBySlugs", () => {
  it("returns products in the requested order, skipping unknown and duplicate slugs", async () => {
    repo.findBySlugs.mockResolvedValue([product("b"), product("a")]);

    const result = await productService.listBySlugs(["a", "missing", "b", "a"]);

    expect(repo.findBySlugs).toHaveBeenCalledWith(["a", "missing", "b"]);
    expect(result.items.map((item) => item.slug)).toEqual(["a", "b"]);
    expect(result.meta).toEqual({ page: 1, limit: 3, total: 2 });
  });
});

describe("productService.list", () => {
  it("translates page/limit into an offset", async () => {
    repo.findPage.mockResolvedValue([]);
    repo.count.mockResolvedValue(30);

    const result = await productService.list(3, 10);

    expect(repo.findPage).toHaveBeenCalledWith(20, 10);
    expect(result.meta).toEqual({ page: 3, limit: 10, total: 30 });
  });
});

describe("productService.getRelated", () => {
  it("prefers the product's own category and excludes the product", async () => {
    repo.findBySlug.mockResolvedValue(product("a", { id: 7, categoryId: 2 }));
    repo.findOthersPreferringCategory.mockResolvedValue([]);

    await productService.getRelated("a", 4);

    expect(repo.findOthersPreferringCategory).toHaveBeenCalledWith(7, 2, 4);
  });
});
