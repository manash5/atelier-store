import type { orderItems, orders, ShippingAddressData } from "../database/schema";

export type Order = typeof orders.$inferSelect;
export type OrderItem = typeof orderItems.$inferSelect;
export type OrderWithItems = Order & { items: OrderItem[] };
export type ShippingAddress = ShippingAddressData;

/** Shipping is complimentary on every order (see the storefront services strip). */
export const SHIPPING_COST = 0;
