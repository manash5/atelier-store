import { beforeEach, describe, expect, it, vi } from "vitest";

import { ConflictError, NotFoundError } from "../../src/exceptions";
import { canTransition, ORDER_TRANSITIONS, type OrderWithCustomer } from "../../src/models/order";
import type { Product } from "../../src/models/product";
import type { User } from "../../src/models/user";
import { adminCatalogRepository } from "../../src/repositories/admin-catalog.repository";
import { adminOrderRepository } from "../../src/repositories/admin-order.repository";
import { adminUserRepository } from "../../src/repositories/admin-user.repository";
import { userRepository } from "../../src/repositories/user.repository";
import { adminCatalogService } from "../../src/services/admin-catalog.service";
import { adminOrderService } from "../../src/services/admin-order.service";
import { adminUserService } from "../../src/services/admin-user.service";

vi.mock("../../src/repositories/admin-order.repository", () => ({
  adminOrderRepository: {
    findByNumber: vi.fn(),
    transition: vi.fn(),
    findPage: vi.fn(),
    count: vi.fn(),
    summary: vi.fn(),
  },
}));
vi.mock("../../src/repositories/admin-catalog.repository", () => ({
  adminCatalogRepository: {
    findProductBySlug: vi.fn(),
    setStock: vi.fn(),
    slugTaken: vi.fn(),
    styleNumberTaken: vi.fn(),
    findCategoryBySlug: vi.fn(),
    insertProduct: vi.fn(),
    updateProduct: vi.fn(),
  },
}));
vi.mock("../../src/repositories/admin-user.repository", () => ({
  adminUserRepository: { countAdmins: vi.fn(), findPage: vi.fn(), count: vi.fn() },
}));
vi.mock("../../src/repositories/user.repository", () => ({
  userRepository: { findById: vi.fn(), setRole: vi.fn() },
}));

const orders = vi.mocked(adminOrderRepository);
const catalog = vi.mocked(adminCatalogRepository);
const adminUsers = vi.mocked(adminUserRepository);
const users = vi.mocked(userRepository);

beforeEach(() => {
  vi.resetAllMocks();
});

function order(status: OrderWithCustomer["status"]): OrderWithCustomer {
  return {
    id: 7,
    number: "AT-ABCDEFGH",
    userId: "u1",
    status,
    email: "ada@example.com",
    shippingAddress: { fullName: "Ada", line1: "1 Way", city: "Paris", postalCode: "75001", country: "France" },
    subtotal: 100_00,
    shipping: 0,
    total: 100_00,
    currency: "USD",
    paymentLast4: "4242",
    createdAt: new Date(0),
    updatedAt: new Date(0),
    items: [],
    user: { id: "u1", name: "Ada", email: "ada@example.com" },
  };
}

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
    colorHex: "#ffffff",
    stock: 5,
    description: "",
    details: [],
    images: [{ src: "/uploads/a.png", alt: "" }],
    badge: null,
    gender: "unisex",
    createdAt: new Date(0),
    updatedAt: new Date(0),
    category: { slug: "accessories", title: "Accessories" },
    ...overrides,
  };
}

function user(overrides: Partial<User> = {}): User {
  return {
    id: "target",
    name: "Grace",
    email: "grace@example.com",
    emailVerified: true,
    image: null,
    role: "user",
    banned: false,
    banReason: null,
    banExpires: null,
    createdAt: new Date(0),
    updatedAt: new Date(0),
    ...overrides,
  };
}

describe("order status transitions", () => {
  it.each([
    ["paid", "processing", true],
    ["paid", "cancelled", true],
    ["processing", "shipped", true],
    ["processing", "cancelled", true],
    ["shipped", "delivered", true],
    ["shipped", "cancelled", false],
    ["delivered", "cancelled", false],
    ["cancelled", "paid", false],
    ["paid", "delivered", false],
  ] as const)("%s → %s allowed: %s", (from, to, allowed) => {
    expect(canTransition(from, to)).toBe(allowed);
  });

  it("final statuses have no next step", () => {
    expect(ORDER_TRANSITIONS.delivered).toEqual([]);
    expect(ORDER_TRANSITIONS.cancelled).toEqual([]);
  });
});

describe("adminOrderService.updateStatus", () => {
  it("404s for unknown orders", async () => {
    orders.findByNumber.mockResolvedValue(null);
    await expect(adminOrderService.updateStatus("AT-ABCDEFGH", "processing")).rejects.toBeInstanceOf(NotFoundError);
  });

  it("refuses transitions that aren't allowed", async () => {
    orders.findByNumber.mockResolvedValue(order("shipped"));
    await expect(adminOrderService.updateStatus("AT-ABCDEFGH", "cancelled")).rejects.toThrow(
      "An order that is shipped can't be marked cancelled",
    );
    expect(orders.transition).not.toHaveBeenCalled();
  });

  it("applies the change from the status it read", async () => {
    orders.findByNumber.mockResolvedValueOnce(order("paid")).mockResolvedValueOnce(order("cancelled"));
    orders.transition.mockResolvedValue(true);
    const result = await adminOrderService.updateStatus("AT-ABCDEFGH", "cancelled");
    expect(orders.transition).toHaveBeenCalledWith(7, "paid", "cancelled");
    expect(result.status).toBe("cancelled");
  });

  it("reports a concurrent change as a conflict", async () => {
    orders.findByNumber.mockResolvedValue(order("paid"));
    orders.transition.mockResolvedValue(false);
    await expect(adminOrderService.updateStatus("AT-ABCDEFGH", "processing")).rejects.toThrow(
      "updated by someone else",
    );
  });

  it("is a no-op when the order already has that status", async () => {
    orders.findByNumber.mockResolvedValue(order("processing"));
    await adminOrderService.updateStatus("AT-ABCDEFGH", "processing");
    expect(orders.transition).not.toHaveBeenCalled();
  });
});

describe("adminCatalogService", () => {
  it("sets stock when it still matches what the admin saw", async () => {
    catalog.findProductBySlug.mockResolvedValue(product({ stock: 5 }));
    catalog.setStock.mockResolvedValue(true);
    await adminCatalogService.setStock("silk-scarf", 12, 5);
    expect(catalog.setStock).toHaveBeenCalledWith(1, 5, 12);
  });

  it("refuses to overwrite stock changed by an order meanwhile", async () => {
    catalog.findProductBySlug.mockResolvedValueOnce(product({ stock: 5 })).mockResolvedValueOnce(product({ stock: 4 }));
    catalog.setStock.mockResolvedValue(false);
    const error = await adminCatalogService.setStock("silk-scarf", 12, 5).catch((e: unknown) => e);
    expect(error).toBeInstanceOf(ConflictError);
    expect((error as ConflictError).message).toContain("Stock changed to 4");
  });

  it("rejects a duplicate slug on create", async () => {
    catalog.slugTaken.mockResolvedValue(true);
    await expect(
      adminCatalogService.createProduct({ slug: "silk-scarf", styleNumber: "S9" } as never),
    ).rejects.toThrow('"silk-scarf" is already used');
    expect(catalog.insertProduct).not.toHaveBeenCalled();
  });

  it("rejects a style number used by another product on update", async () => {
    catalog.findProductBySlug.mockResolvedValue(product());
    catalog.styleNumberTaken.mockResolvedValue(true);
    await expect(adminCatalogService.updateProduct("silk-scarf", { styleNumber: "S2" })).rejects.toBeInstanceOf(
      ConflictError,
    );
    expect(catalog.styleNumberTaken).toHaveBeenCalledWith("S2", 1);
  });

  it("rejects an unknown category", async () => {
    catalog.findProductBySlug.mockResolvedValue(product());
    catalog.findCategoryBySlug.mockResolvedValue(null);
    await expect(adminCatalogService.updateProduct("silk-scarf", { categorySlug: "nope" })).rejects.toThrow(
      'Category "nope" doesn\'t exist',
    );
  });
});

describe("adminUserService.setRole", () => {
  it("promotes a customer", async () => {
    users.findById.mockResolvedValueOnce(user()).mockResolvedValueOnce(user({ role: "admin" }));
    const result = await adminUserService.setRole("me", "target", "admin");
    expect(users.setRole).toHaveBeenCalledWith("target", "admin");
    expect(result.role).toBe("admin");
  });

  it("won't promote a suspended account", async () => {
    users.findById.mockResolvedValue(user({ banned: true }));
    await expect(adminUserService.setRole("me", "target", "admin")).rejects.toThrow("Suspended");
  });

  it("won't let admins remove their own access", async () => {
    users.findById.mockResolvedValue(user({ id: "me", role: "admin" }));
    await expect(adminUserService.setRole("me", "me", "user")).rejects.toThrow("your own admin access");
    expect(users.setRole).not.toHaveBeenCalled();
  });

  it("keeps at least one admin", async () => {
    users.findById.mockResolvedValue(user({ role: "admin" }));
    adminUsers.countAdmins.mockResolvedValue(1);
    await expect(adminUserService.setRole("me", "target", "user")).rejects.toThrow("at least one admin");
  });

  it("demotes another admin when others remain", async () => {
    users.findById.mockResolvedValueOnce(user({ role: "admin" })).mockResolvedValueOnce(user());
    adminUsers.countAdmins.mockResolvedValue(2);
    await adminUserService.setRole("me", "target", "user");
    expect(users.setRole).toHaveBeenCalledWith("target", "user");
  });

  it("404s for unknown users", async () => {
    users.findById.mockResolvedValue(null);
    await expect(adminUserService.setRole("me", "ghost", "admin")).rejects.toBeInstanceOf(NotFoundError);
  });
});
