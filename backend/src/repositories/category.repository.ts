import { asc } from "drizzle-orm";

import { db } from "../database";
import { categories } from "../database/schema";
import type { Category } from "../models/category";

export const categoryRepository = {
  async findBySlug(slug: string): Promise<Category | null> {
    const category = await db.query.categories.findFirst({
      where: (table, { eq }) => eq(table.slug, slug),
    });
    return category ?? null;
  },

  async findAll(): Promise<Category[]> {
    return db.query.categories.findMany({
      orderBy: [asc(categories.sortOrder), asc(categories.id)],
    });
  },
};
