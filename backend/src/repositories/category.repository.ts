import { asc } from "drizzle-orm";

import { db } from "../database";
import { categories } from "../database/schema";
import type { Category } from "../models/category";

export const categoryRepository = {
  async findAll(): Promise<Category[]> {
    return db.query.categories.findMany({
      orderBy: [asc(categories.sortOrder), asc(categories.id)],
    });
  },
};
