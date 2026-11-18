import { and, asc, eq, sql } from "drizzle-orm";

import { db } from "../database";
import { cartItems } from "../database/schema";
import type { CartItem, CartLine } from "../models/cart";

export const cartRepository = {
  /** The user's cart lines with their current products, oldest first. */
  async findLines(userId: string): Promise<CartLine[]> {
    return db.query.cartItems.findMany({
      where: eq(cartItems.userId, userId),
      orderBy: [asc(cartItems.createdAt), asc(cartItems.id)],
      with: { product: { with: { category: { columns: { slug: true, title: true } } } } },
    });
  },

  async findItem(userId: string, productId: number): Promise<CartItem | null> {
    const item = await db.query.cartItems.findFirst({
      where: and(eq(cartItems.userId, userId), eq(cartItems.productId, productId)),
    });
    return item ?? null;
  },

  /** Inserts the line or replaces its quantity. */
  async setQuantity(userId: string, productId: number, quantity: number): Promise<void> {
    await db
      .insert(cartItems)
      .values({ userId, productId, quantity })
      .onConflictDoUpdate({
        target: [cartItems.userId, cartItems.productId],
        set: { quantity, updatedAt: sql`now()` },
      });
  },

  /** True if a line was removed. */
  async remove(userId: string, productId: number): Promise<boolean> {
    const removed = await db
      .delete(cartItems)
      .where(and(eq(cartItems.userId, userId), eq(cartItems.productId, productId)))
      .returning({ id: cartItems.id });
    return removed.length > 0;
  },

  /** Total units in the cart. */
  async countUnits(userId: string): Promise<number> {
    const [row] = await db
      .select({ units: sql<number>`coalesce(sum(${cartItems.quantity}), 0)::int` })
      .from(cartItems)
      .where(eq(cartItems.userId, userId));
    return row?.units ?? 0;
  },
};
