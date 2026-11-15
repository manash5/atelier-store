import type { categories, products } from "../database/schema";

export type StockStatus = "in-stock" | "low-stock" | "sold-out";

/** A product row joined with the category fields the storefront needs. */
export type Product = typeof products.$inferSelect & {
  category: Pick<typeof categories.$inferSelect, "slug" | "title">;
};

/** At or below this many units, shoppers see a "only N left" message. */
export const LOW_STOCK_THRESHOLD = 3;

/** Stock status is derived from the quantity, never stored. */
export function deriveStockStatus(stock: number): StockStatus {
  if (stock <= 0) return "sold-out";
  if (stock <= LOW_STOCK_THRESHOLD) return "low-stock";
  return "in-stock";
}
