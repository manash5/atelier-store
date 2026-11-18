import { and, asc, desc, eq, ilike, lte, ne, or, sql, type SQL } from "drizzle-orm";

import { db } from "../database";
import { categories, products } from "../database/schema";
import type { Category, CategoryWithCount } from "../models/category";
import { LOW_STOCK_THRESHOLD, type Product } from "../models/product";

export type AdminProductFilter = {
  /** Partial match on name, slug or style number. */
  search?: string | undefined;
  categorySlug?: string | undefined;
  /** `low`: 1–LOW_STOCK_THRESHOLD units; `out`: sold out. */
  stock?: "low" | "out" | undefined;
};

export type NewProduct = typeof products.$inferInsert;
export type ProductChanges = Partial<Omit<NewProduct, "id" | "slug" | "stock" | "createdAt">>;
export type NewCategory = typeof categories.$inferInsert;
export type CategoryChanges = Partial<Pick<NewCategory, "title" | "image" | "sortOrder">>;

function escapeLike(value: string): string {
  return value.replace(/[\\%_]/g, (char) => `\\${char}`);
}

function productWhere({ search, categorySlug, stock }: AdminProductFilter): SQL | undefined {
  const pattern = search ? `%${escapeLike(search)}%` : undefined;
  return and(
    pattern
      ? or(
          ilike(products.name, pattern),
          ilike(products.slug, pattern),
          ilike(products.styleNumber, pattern),
        )
      : undefined,
    categorySlug
      ? eq(
          products.categoryId,
          sql`(select ${categories.id} from ${categories} where ${categories.slug} = ${categorySlug})`,
        )
      : undefined,
    stock === "out" ? eq(products.stock, 0) : undefined,
    stock === "low"
      ? and(sql`${products.stock} > 0`, lte(products.stock, LOW_STOCK_THRESHOLD))
      : undefined,
  );
}

const withCategory = { category: { columns: { slug: true, title: true } } } as const;

export const adminCatalogRepository = {
  /** Products for the admin list: most recently updated first. */
  async findProductPage(offset: number, limit: number, filter: AdminProductFilter): Promise<Product[]> {
    return db.query.products.findMany({
      where: productWhere(filter),
      orderBy: [desc(products.updatedAt), desc(products.id)],
      offset,
      limit,
      with: withCategory,
    });
  },

  async countProducts(filter: AdminProductFilter): Promise<number> {
    return db.$count(products, productWhere(filter));
  },

  async findProductBySlug(slug: string): Promise<Product | null> {
    const product = await db.query.products.findFirst({
      where: eq(products.slug, slug),
      with: withCategory,
    });
    return product ?? null;
  },

  async slugTaken(slug: string): Promise<boolean> {
    return (await db.$count(products, eq(products.slug, slug))) > 0;
  },

  /** True if another product (not `exceptId`) already uses the style number. */
  async styleNumberTaken(styleNumber: string, exceptId?: number): Promise<boolean> {
    const where = and(
      eq(products.styleNumber, styleNumber),
      exceptId === undefined ? undefined : ne(products.id, exceptId),
    );
    return (await db.$count(products, where)) > 0;
  },

  async insertProduct(values: NewProduct): Promise<void> {
    await db.insert(products).values(values);
  },

  async updateProduct(id: number, changes: ProductChanges): Promise<void> {
    await db.update(products).set(changes).where(eq(products.id, id));
  },

  /**
   * Sets stock only if it still equals `expected`, so an order placed while
   * the admin was editing isn't overwritten. Returns false on a mismatch.
   */
  async setStock(id: number, expected: number, stock: number): Promise<boolean> {
    const updated = await db
      .update(products)
      .set({ stock })
      .where(and(eq(products.id, id), eq(products.stock, expected)))
      .returning({ id: products.id });
    return updated.length > 0;
  },

  /** Products below or at the low-stock threshold, lowest first. */
  async findLowStock(limit: number): Promise<Product[]> {
    return db.query.products.findMany({
      where: lte(products.stock, LOW_STOCK_THRESHOLD),
      orderBy: [asc(products.stock), asc(products.name)],
      limit,
      with: withCategory,
    });
  },

  async countAllProducts(): Promise<number> {
    return db.$count(products);
  },

  // ---- Categories ----

  async findCategoriesWithCounts(): Promise<CategoryWithCount[]> {
    const rows = await db
      .select({
        category: categories,
        productCount: sql<number>`(select count(*)::int from ${products} where ${products.categoryId} = ${categories.id})`,
      })
      .from(categories)
      .orderBy(asc(categories.sortOrder), asc(categories.id));
    return rows.map((row) => ({ ...row.category, productCount: row.productCount }));
  },

  async findCategoryBySlug(slug: string): Promise<Category | null> {
    const category = await db.query.categories.findFirst({ where: eq(categories.slug, slug) });
    return category ?? null;
  },

  async insertCategory(values: NewCategory): Promise<void> {
    await db.insert(categories).values(values);
  },

  async updateCategory(id: number, changes: CategoryChanges): Promise<void> {
    await db.update(categories).set(changes).where(eq(categories.id, id));
  },

  async nextCategorySortOrder(): Promise<number> {
    const [row] = await db
      .select({ next: sql<number>`coalesce(max(${categories.sortOrder}), -1)::int + 1` })
      .from(categories);
    return row?.next ?? 0;
  },
};
