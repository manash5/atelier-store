import { relations, sql } from "drizzle-orm";
import {
  check,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  unique,
} from "drizzle-orm/pg-core";

import { user } from "./auth";
import { type ImageData, products } from "./catalog";

// Carts and orders (ADR-015). One cart per user, stored as rows of
// (user, product, quantity). Orders snapshot product data and prices so they
// stay correct after the catalog changes.

const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
};

export const cartItems = pgTable(
  "cart_items",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    productId: integer("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    quantity: integer("quantity").notNull(),
    ...timestamps,
  },
  (table) => [
    unique("cart_items_user_product_unique").on(table.userId, table.productId),
    index("cart_items_user_id_idx").on(table.userId),
    check("cart_items_quantity_positive", sql`${table.quantity} > 0`),
  ],
);

/** Payments are simulated for now, so every placed order is `paid`. */
export const orderStatus = pgEnum("order_status", ["paid", "cancelled"]);

/** Shipping address captured at checkout. */
export type ShippingAddressData = {
  fullName: string;
  line1: string;
  line2?: string;
  city: string;
  postalCode: string;
  country: string;
  phone?: string;
};

export const orders = pgTable(
  "orders",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    /** Public order reference, e.g. `AT-7K3F9Q2M`. */
    number: text("number").notNull().unique(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    status: orderStatus("status").notNull().default("paid"),
    email: text("email").notNull(),
    shippingAddress: jsonb("shipping_address").$type<ShippingAddressData>().notNull(),
    /** Integer minor units of `currency`. */
    subtotal: integer("subtotal").notNull(),
    shipping: integer("shipping").notNull().default(0),
    total: integer("total").notNull(),
    currency: text("currency").notNull(),
    /** Last four digits of the (simulated) card, for display only. */
    paymentLast4: text("payment_last4"),
    ...timestamps,
  },
  (table) => [
    index("orders_user_id_idx").on(table.userId),
    check("orders_total_nonnegative", sql`${table.total} >= 0`),
  ],
);

export const orderItems = pgTable(
  "order_items",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    orderId: integer("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    /** Null once the product is deleted; the snapshot below remains. */
    productId: integer("product_id").references(() => products.id, { onDelete: "set null" }),
    productSlug: text("product_slug").notNull(),
    name: text("name").notNull(),
    colorName: text("color_name").notNull(),
    image: jsonb("image").$type<ImageData>().notNull(),
    unitPrice: integer("unit_price").notNull(),
    quantity: integer("quantity").notNull(),
  },
  (table) => [
    index("order_items_order_id_idx").on(table.orderId),
    check("order_items_quantity_positive", sql`${table.quantity} > 0`),
  ],
);

export const cartItemsRelations = relations(cartItems, ({ one }) => ({
  product: one(products, { fields: [cartItems.productId], references: [products.id] }),
}));

export const ordersRelations = relations(orders, ({ many }) => ({
  items: many(orderItems),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, { fields: [orderItems.orderId], references: [orders.id] }),
}));
