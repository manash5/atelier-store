import type { categories } from "../database/schema";

export type Category = typeof categories.$inferSelect;

/** A category with how many products it has (admin views). */
export type CategoryWithCount = Category & { productCount: number };
