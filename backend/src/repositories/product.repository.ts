import { asc, inArray, ne, sql } from "drizzle-orm";

import { db } from "../database";
import { products } from "../database/schema";
import type { Product } from "../models/product";

const withCategory = {
  category: { columns: { slug: true, title: true } },
} as const;

export const productRepository = {
  async findBySlug(slug: string): Promise<Product | null> {
    const product = await db.query.products.findFirst({
      where: (table, { eq }) => eq(table.slug, slug),
      with: withCategory,
    });
    return product ?? null;
  },

  /** Unordered; callers decide the order. */
  async findBySlugs(slugs: string[]): Promise<Product[]> {
    if (slugs.length === 0) return [];
    return db.query.products.findMany({
      where: inArray(products.slug, slugs),
      with: withCategory,
    });
  },

  /** A page of the catalog in catalog (insertion) order. */
  async findPage(offset: number, limit: number): Promise<Product[]> {
    return db.query.products.findMany({
      orderBy: asc(products.id),
      offset,
      limit,
      with: withCategory,
    });
  },

  async count(): Promise<number> {
    return db.$count(products);
  },

  /**
   * Other products with those in `categoryId` first, each group in catalog
   * order.
   */
  async findOthersPreferringCategory(
    excludeId: number,
    categoryId: number,
    limit: number,
  ): Promise<Product[]> {
    return db.query.products.findMany({
      where: ne(products.id, excludeId),
      orderBy: [
        sql`(${products.categoryId} = ${categoryId}) DESC`,
        asc(products.id),
      ],
      limit,
      with: withCategory,
    });
  },
};
