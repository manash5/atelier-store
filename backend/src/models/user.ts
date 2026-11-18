import type { user } from "../database/schema";

export type User = typeof user.$inferSelect;
