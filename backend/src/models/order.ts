import type { orderItems, orders, ShippingAddressData } from "../database/schema";

export type Order = typeof orders.$inferSelect;
export type OrderItem = typeof orderItems.$inferSelect;
export type OrderWithItems = Order & { items: OrderItem[] };
export type OrderStatus = Order["status"];
export type ShippingAddress = ShippingAddressData;

/** An order with the account that placed it (admin views). */
export type OrderWithCustomer = OrderWithItems & {
  user: { id: string; name: string; email: string } | null;
};

/** Order counts per status and revenue (admin overview). */
export type OrderSummary = {
  byStatus: Partial<Record<OrderStatus, number>>;
  /** Sum of totals of orders that weren't cancelled (minor units). */
  revenue: number;
  currency: string | null;
};

/** Shipping is complimentary on every order (see the storefront services strip). */
export const SHIPPING_COST = 0;

/**
 * Allowed status changes. Orders only move forward; they can be cancelled
 * until they ship, and cancelling returns their items to stock.
 */
export const ORDER_TRANSITIONS: Record<OrderStatus, readonly OrderStatus[]> = {
  paid: ["processing", "cancelled"],
  processing: ["shipped", "cancelled"],
  shipped: ["delivered"],
  delivered: [],
  cancelled: [],
};

export function canTransition(from: OrderStatus, to: OrderStatus): boolean {
  return ORDER_TRANSITIONS[from].includes(to);
}
