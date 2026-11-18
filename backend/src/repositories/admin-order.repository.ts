import { and, desc, eq, ilike, isNotNull, ne, or, sql, type SQL } from "drizzle-orm";

import { db } from "../database";
import { orderItems, orders, products } from "../database/schema";
import type { OrderStatus, OrderSummary, OrderWithCustomer } from "../models/order";

export type AdminOrderFilter = {
  status?: OrderStatus | undefined;
  /** Partial match on order number or checkout email. */
  search?: string | undefined;
};

function escapeLike(value: string): string {
  return value.replace(/[\\%_]/g, (char) => `\\${char}`);
}

function filterWhere({ status, search }: AdminOrderFilter): SQL | undefined {
  const pattern = search ? `%${escapeLike(search)}%` : undefined;
  return and(
    status ? eq(orders.status, status) : undefined,
    pattern ? or(ilike(orders.number, pattern), ilike(orders.email, pattern)) : undefined,
  );
}

export const adminOrderRepository = {
  /** Orders across all users, newest first. */
  async findPage(offset: number, limit: number, filter: AdminOrderFilter): Promise<OrderWithCustomer[]> {
    return db.query.orders.findMany({
      where: filterWhere(filter),
      orderBy: [desc(orders.createdAt), desc(orders.id)],
      offset,
      limit,
      with: {
        items: { orderBy: (items, { asc }) => [asc(items.id)] },
        user: { columns: { id: true, name: true, email: true } },
      },
    });
  },

  async count(filter: AdminOrderFilter): Promise<number> {
    return db.$count(orders, filterWhere(filter));
  },

  async findByNumber(number: string): Promise<OrderWithCustomer | null> {
    const order = await db.query.orders.findFirst({
      where: eq(orders.number, number),
      with: {
        items: { orderBy: (items, { asc }) => [asc(items.id)] },
        user: { columns: { id: true, name: true, email: true } },
      },
    });
    return order ?? null;
  },

  async summary(): Promise<OrderSummary> {
    const rows = await db
      .select({ status: orders.status, count: sql<number>`count(*)::int` })
      .from(orders)
      .groupBy(orders.status);
    const [totals] = await db
      .select({
        revenue: sql<number>`coalesce(sum(${orders.total}), 0)::int`,
        currency: sql<string | null>`min(${orders.currency})`,
      })
      .from(orders)
      .where(ne(orders.status, "cancelled"));
    return {
      byStatus: Object.fromEntries(rows.map((row) => [row.status, row.count])),
      revenue: totals?.revenue ?? 0,
      currency: totals?.currency ?? null,
    };
  },

  /**
   * Moves the order from `from` to `to` only if it is still in `from`, so two
   * admins can't apply the same change twice. Cancelling also returns every
   * item whose product still exists to stock, in the same transaction.
   * Returns false when the order had already changed.
   */
  async transition(orderId: number, from: OrderStatus, to: OrderStatus): Promise<boolean> {
    return db.transaction(async (tx) => {
      const updated = await tx
        .update(orders)
        .set({ status: to, updatedAt: sql`now()` })
        .where(and(eq(orders.id, orderId), eq(orders.status, from)))
        .returning({ id: orders.id });
      if (updated.length === 0) return false;

      if (to === "cancelled") {
        const items = await tx
          .select({ productId: orderItems.productId, quantity: orderItems.quantity })
          .from(orderItems)
          .where(and(eq(orderItems.orderId, orderId), isNotNull(orderItems.productId)));

        const byProduct = new Map<number, number>();
        for (const item of items) {
          if (item.productId === null) continue;
          byProduct.set(item.productId, (byProduct.get(item.productId) ?? 0) + item.quantity);
        }
        // Same lock order as checkout (product id) to avoid deadlocks.
        for (const [productId, quantity] of [...byProduct].sort(([a], [b]) => a - b)) {
          await tx
            .update(products)
            .set({ stock: sql`${products.stock} + ${quantity}`, updatedAt: sql`now()` })
            .where(eq(products.id, productId));
        }
      }
      return true;
    });
  },
};
