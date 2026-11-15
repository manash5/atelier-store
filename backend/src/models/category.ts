import type { categories } from "../database/schema";

export type Category = typeof categories.$inferSelect;
