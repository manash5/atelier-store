import type { cartItems } from "../database/schema";
import type { Product } from "./product";

/** Most units of one product a shopper can hold in their bag. */
export const MAX_QUANTITY_PER_ITEM = 10;

export type CartItem = typeof cartItems.$inferSelect;

/** A cart row joined with its (current) product. */
export type CartLine = CartItem & { product: Product };

/** The cart with totals computed from live prices and stock. */
export type Cart = {
  lines: CartLine[];
  /** Total units. */
  itemCount: number;
  /** Integer minor units of `currency`. */
  subtotal: number;
  currency: string;
  hasIssues: boolean;
};

/** Why a line can't be checked out as it is. */
export type CartLineIssue = "sold-out" | "insufficient-stock" | null;

/** Most units of this product the shopper may have in the bag right now. */
export function maxQuantityFor(stock: number): number {
  return Math.max(0, Math.min(stock, MAX_QUANTITY_PER_ITEM));
}

/** Checked against live stock every time the cart is read. */
export function deriveLineIssue(quantity: number, stock: number): CartLineIssue {
  if (stock <= 0) return "sold-out";
  if (quantity > stock) return "insufficient-stock";
  return null;
}
