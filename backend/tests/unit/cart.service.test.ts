import { beforeEach, describe, expect, it, vi } from "vitest";

import { ConflictError, NotFoundError } from "../../src/exceptions";
import type { CartItem, CartLine } from "../../src/models/cart";
import { deriveLineIssue, maxQuantityFor } from "../../src/models/cart";
import type { Product } from "../../src/models/product";
import { cartRepository } from "../../src/repositories/cart.repository";
import { orderRepository } from "../../src/repositories/order.repository";
import { productRepository } from "../../src/repositories/product.repository";
import { cartService } from "../../src/services/cart.service";
import { orderService } from "../../src/services/order.service";

vi.mock("../../src/repositories/cart.repository", () => ({
  cartRepository: {
    findLines: vi.fn(),
    findItem: vi.fn(),
    setQuantity: vi.fn(),
    remove: vi.fn(),
    countUnits: vi.fn(),
  },
}));
vi.mock("../../src/repositories/product.repository", () => ({
  productRepository: { findBySlug: vi.fn() },
}));
vi.mock("../../src/repositories/order.repository", () => ({
  orderRepository: { placeFromCart: vi.fn(), numberExists: vi.fn(), findByNumber: vi.fn() },
}));

const carts = vi.mocked(cartRepository);
const productsRepo = vi.mocked(productRepository);
const ordersRepo = vi.mocked(orderRepository);

function product(overrides: Partial<Product> = {}): Product {
  return {
    id: 1,
    slug: "silk-scarf",
    categoryId: 1,
    name: "Silk Scarf",
    styleNumber: "S1",
    price: 250_00,
    currency: "USD",
    colorName: "Ivory",
    colorHex: "#fff",
    stock: 5,
    description: "",
    details: [],
    images: [{ src: "https://example.com/a.jpg", alt: "" }],
    badge: null,
    gender: "unisex",
    createdAt: new Date(0),
    updatedAt: new Date(0),
    category: { slug: "accessories", title: "Accessories" },
    ...overrides,
  };
}

function item(quantity: number, productId = 1): CartItem {
  return {
    id: 1,
    userId: "u1",
    productId,
    quantity,
    createdAt: new Date(0),
    updatedAt: new Date(0),
  };
}

function line(quantity: number, overrides: Partial<Product> = {}): CartLine {
  const p = product(overrides);
  return { ...item(quantity, p.id), product: p };
}

beforeEach(() => {
  vi.resetAllMocks();
  carts.findLines.mockResolvedValue([]);
});

describe("cart model rules", () => {
  it.each([
    [0, 0],
    [3, 3],
    [25, 10],
  ])("stock %i allows at most %i", (stock, max) => {
    expect(maxQuantityFor(stock)).toBe(max);
  });

  it.each([
    [1, 0, "sold-out"],
    [3, 2, "insufficient-stock"],
    [2, 2, null],
  ] as const)("quantity %i with stock %i → %s", (quantity, stock, issue) => {
    expect(deriveLineIssue(quantity, stock)).toBe(issue);
  });
});

describe("cartService.add", () => {
  it("rejects unknown products", async () => {
    productsRepo.findBySlug.mockResolvedValue(null);
    await expect(cartService.add("u1", "nope", 1)).rejects.toBeInstanceOf(NotFoundError);
  });

  it("rejects sold-out products", async () => {
    productsRepo.findBySlug.mockResolvedValue(product({ stock: 0 }));
    await expect(cartService.add("u1", "silk-scarf", 1)).rejects.toThrow("is sold out");
    expect(carts.setQuantity).not.toHaveBeenCalled();
  });

  it("merges with the existing line", async () => {
    productsRepo.findBySlug.mockResolvedValue(product({ stock: 5 }));
    carts.findItem.mockResolvedValue(item(2));
    await cartService.add("u1", "silk-scarf", 1);
    expect(carts.setQuantity).toHaveBeenCalledWith("u1", 1, 3);
  });

  it("refuses to exceed stock, counting what is already in the bag", async () => {
    productsRepo.findBySlug.mockResolvedValue(product({ stock: 2 }));
    carts.findItem.mockResolvedValue(item(2));
    const error = await cartService.add("u1", "silk-scarf", 1).catch((e: unknown) => e);
    expect(error).toBeInstanceOf(ConflictError);
    expect((error as ConflictError).message).toBe(
      "Only 2 of Silk Scarf are available and 2 are already in your bag.",
    );
  });

  it("caps each line at 10 units", async () => {
    productsRepo.findBySlug.mockResolvedValue(product({ stock: 50 }));
    carts.findItem.mockResolvedValue(item(10));
    await expect(cartService.add("u1", "silk-scarf", 1)).rejects.toThrow("up to 10");
  });

  it("returns the summarized cart", async () => {
    productsRepo.findBySlug.mockResolvedValue(product());
    carts.findItem.mockResolvedValue(null);
    carts.findLines.mockResolvedValue([line(2), line(1, { id: 2, slug: "b", price: 100_00, stock: 0 })]);
    const cart = await cartService.add("u1", "silk-scarf", 2);
    expect(cart).toMatchObject({ itemCount: 3, subtotal: 600_00, currency: "USD", hasIssues: true });
  });
});

describe("cartService.setQuantity", () => {
  it("allows lowering below a reduced stock", async () => {
    productsRepo.findBySlug.mockResolvedValue(product({ stock: 1 }));
    carts.findItem.mockResolvedValue(item(3));
    await cartService.setQuantity("u1", "silk-scarf", 2);
    expect(carts.setQuantity).toHaveBeenCalledWith("u1", 1, 2);
  });

  it("refuses raising above stock", async () => {
    productsRepo.findBySlug.mockResolvedValue(product({ stock: 3 }));
    carts.findItem.mockResolvedValue(item(2));
    await expect(cartService.setQuantity("u1", "silk-scarf", 4)).rejects.toBeInstanceOf(ConflictError);
  });

  it("404s for products not in the bag", async () => {
    productsRepo.findBySlug.mockResolvedValue(product());
    carts.findItem.mockResolvedValue(null);
    await expect(cartService.setQuantity("u1", "silk-scarf", 1)).rejects.toBeInstanceOf(NotFoundError);
  });
});

describe("orderService.place", () => {
  const input = {
    userId: "u1",
    email: "ada@example.com",
    shippingAddress: { fullName: "Ada", line1: "1 Way", city: "Paris", postalCode: "75001", country: "France" },
    cardLast4: "4242",
  };

  it("rejects an empty bag", async () => {
    await expect(orderService.place(input)).rejects.toThrow("Your bag is empty");
  });

  it("rejects a bag with unavailable lines before touching stock", async () => {
    carts.findLines.mockResolvedValue([line(3, { stock: 2 })]);
    await expect(orderService.place(input)).rejects.toBeInstanceOf(ConflictError);
    expect(ordersRepo.placeFromCart).not.toHaveBeenCalled();
  });

  it("places the order with computed totals", async () => {
    carts.findLines.mockResolvedValue([line(2), line(1, { id: 2, slug: "b", price: 100_00 })]);
    ordersRepo.numberExists.mockResolvedValue(false);
    ordersRepo.placeFromCart.mockImplementation(async (order) => ({
      ok: true,
      order: { ...order, id: 1, status: "paid", items: [], createdAt: new Date(), updatedAt: new Date() } as never,
    }));
    await orderService.place(input);
    const placed = ordersRepo.placeFromCart.mock.calls[0]![0];
    expect(placed).toMatchObject({ subtotal: 600_00, shipping: 0, total: 600_00, currency: "USD", paymentLast4: "4242" });
    expect(placed.number).toMatch(/^AT-[2-9A-HJ-NP-Z]{8}$/);
  });

  it("reports products that sold out during checkout", async () => {
    carts.findLines.mockResolvedValue([line(1)]);
    ordersRepo.numberExists.mockResolvedValue(false);
    ordersRepo.placeFromCart.mockResolvedValue({ ok: false, outOfStockProductIds: [1] });
    await expect(orderService.place(input)).rejects.toThrow("sold out while you were checking out");
  });
});
