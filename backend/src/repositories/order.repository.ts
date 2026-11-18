import { and, desc, eq, gte, sql } from "drizzle-orm";

import { db } from "../database";
import { cartItems, orderItems, orders, products } from "../database/schema";
import type { CartLine } from "../models/cart";
import type { Order, OrderWithItems, ShippingAddress } from "../models/order";

export type NewOrder = {
  number: string;
  userId: string;
  email: string;
  shippingAddress: ShippingAddress;
  subtotal: number;
  shipping: number;
  total: number;
  currency: string;
  paymentLast4: string;
  lines: CartLine[];
};

export type PlaceOrderResult =
  | { ok: true; order: OrderWithItems }
  | { ok: false; outOfStockProductIds: number[] };

/** Thrown inside the transaction to roll it back; never escapes this file. */
class OutOfStock extends Error {
  constructor(readonly productIds: number[]) {
    super("Out of stock");
  }
}

export const orderRepository = {
  /**
   * In one transaction: reserves stock for every line (a conditional
   * decrement, so concurrent orders can't oversell), writes the order and its
   * item snapshots, and empties the user's cart. If any product no longer has
   * enough stock, nothing is written.
   */
  async placeFromCart(input: NewOrder): Promise<PlaceOrderResult> {
    try {
      const order = await db.transaction(async (tx) => {
        const failed: number[] = [];
        // Lock rows in id order so two concurrent orders can't deadlock.
        const byProduct = [...input.lines].sort((a, b) => a.productId - b.productId);
        for (const line of byProduct) {
          const updated = await tx
            .update(products)
            .set({ stock: sql`${products.stock} - ${line.quantity}`, updatedAt: sql`now()` })
            .where(and(eq(products.id, line.productId), gte(products.stock, line.quantity)))
            .returning({ id: products.id });
          if (updated.length === 0) failed.push(line.productId);
        }
        if (failed.length > 0) throw new OutOfStock(failed);

        const [created] = await tx
          .insert(orders)
          .values({
            number: input.number,
            userId: input.userId,
            email: input.email,
            shippingAddress: input.shippingAddress,
            subtotal: input.subtotal,
            shipping: input.shipping,
            total: input.total,
            currency: input.currency,
            paymentLast4: input.paymentLast4,
          })
          .returning();
        if (!created) throw new Error("Order insert returned no row");

        const items = await tx
          .insert(orderItems)
          .values(
            input.lines.map((line) => ({
              orderId: created.id,
              productId: line.productId,
              productSlug: line.product.slug,
              name: line.product.name,
              colorName: line.product.colorName,
              image: line.product.images[0],
              unitPrice: line.product.price,
              quantity: line.quantity,
            })),
          )
          .returning();

        await tx.delete(cartItems).where(eq(cartItems.userId, input.userId));
        return { ...created, items };
      });
      return { ok: true, order };
    } catch (error) {
      if (error instanceof OutOfStock) return { ok: false, outOfStockProductIds: error.productIds };
      throw error;
    }
  },

  async findByNumber(userId: string, number: string): Promise<OrderWithItems | null> {
    const order = await db.query.orders.findFirst({
      where: and(eq(orders.userId, userId), eq(orders.number, number)),
      with: { items: { orderBy: (items, { asc }) => [asc(items.id)] } },
    });
    return order ?? null;
  },

  /** The user's most recent orders, newest first. */
  async findRecent(userId: string, limit: number): Promise<OrderWithItems[]> {
    return db.query.orders.findMany({
      where: eq(orders.userId, userId),
      orderBy: [desc(orders.createdAt), desc(orders.id)],
      limit,
      with: { items: { orderBy: (items, { asc }) => [asc(items.id)] } },
    });
  },

  async numberExists(number: string): Promise<boolean> {
    const row: Pick<Order, "id"> | undefined = await db.query.orders.findFirst({
      where: eq(orders.number, number),
      columns: { id: true },
    });
    return row !== undefined;
  },
};
