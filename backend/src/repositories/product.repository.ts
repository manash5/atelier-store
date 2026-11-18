import { and, asc, desc, eq, inArray, ne, sql } from "drizzle-orm";

import { db } from "../database";
import { categories, products } from "../database/schema";
import type { Product } from "../models/product";

const withCategory = {
  category: { columns: { slug: true, title: true } },
} as const;

type PageFilter = {
  categorySlug?: string | undefined;
  /** `women` or `men`; unisex products match either. */
  gender?: "women" | "men" | undefined;
};

/**
 * WHERE clause for a catalog page: products in the category with this slug
 * (none if it doesn't exist) and/or for this gender, including unisex.
 */
function pageWhere({ categorySlug, gender }: PageFilter) {
  return and(
    categorySlug === undefined
      ? undefined
      : inArray(
          products.categoryId,
          db
            .select({ id: categories.id })
            .from(categories)
            .where(eq(categories.slug, categorySlug)),
        ),
    gender === undefined ? undefined : inArray(products.gender, [gender, "unisex"]),
  );
}

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

  /**
   * A page of the catalog (optionally filtered) in catalog (insertion)
   * order, or newest first. `id` breaks ties between rows created in the
   * same transaction.
   */
  async findPage(
    offset: number,
    limit: number,
    { order = "catalog", ...filter }: PageFilter & { order?: "catalog" | "newest" } = {},
  ): Promise<Product[]> {
    return db.query.products.findMany({
      where: pageWhere(filter),
      orderBy:
        order === "newest"
          ? [desc(products.createdAt), desc(products.id)]
          : asc(products.id),
      offset,
      limit,
      with: withCategory,
    });
  },

  async count(filter: PageFilter = {}): Promise<number> {
    return db.$count(products, pageWhere(filter));
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
