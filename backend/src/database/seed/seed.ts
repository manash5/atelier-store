// Idempotent catalog seed: upserts categories and products by slug inside one
// transaction. Safe to re-run; it never deletes rows.
//   pnpm --filter @atelier/backend db:seed

import { getTableColumns, sql, type SQL } from "drizzle-orm";
import type { PgTable } from "drizzle-orm/pg-core";

import { db, pool } from "../index";
import { categories, products } from "../schema";
import { seedCategories, seedProducts } from "./data/catalog";

/** `SET col = excluded.col` for every listed column (upsert helper). */
function excluded<T extends PgTable>(table: T, keys: (keyof T["_"]["columns"])[]) {
  const columns = getTableColumns(table);
  return Object.fromEntries(
    keys.map((key) => {
      const column = columns[key as string];
      if (!column) throw new Error(`Unknown column ${String(key)}`);
      return [key, sql.raw(`excluded."${column.name}"`)];
    }),
  ) as Record<keyof T["_"]["columns"], SQL>;
}

async function seed() {
  await db.transaction(async (tx) => {
    const categoryRows = await tx
      .insert(categories)
      .values(
        seedCategories.map((category, index) => ({
          slug: category.slug,
          title: category.title,
          image: category.image,
          sortOrder: index,
        })),
      )
      .onConflictDoUpdate({
        target: categories.slug,
        set: {
          ...excluded(categories, ["title", "image", "sortOrder"]),
          updatedAt: sql`now()`,
        },
      })
      .returning({ id: categories.id, slug: categories.slug });

    const categoryIds = new Map(categoryRows.map((row) => [row.slug, row.id]));

    // One statement per product keeps identity values in catalog order.
    for (const product of seedProducts) {
      const categoryId = categoryIds.get(product.category);
      if (categoryId === undefined) {
        throw new Error(`Unknown category "${product.category}" for ${product.slug}`);
      }

      await tx
        .insert(products)
        .values({
          slug: product.slug,
          categoryId,
          name: product.name,
          styleNumber: product.styleNumber,
          price: Math.round(product.price * 100),
          currency: product.currency,
          colorName: product.color.name,
          colorHex: product.color.hex,
          stock: product.stock,
          description: product.description,
          details: product.details,
          images: product.images,
          badge: product.badge ?? null,
        })
        .onConflictDoUpdate({
          target: products.slug,
          set: {
            ...excluded(products, [
              "categoryId",
              "name",
              "styleNumber",
              "price",
              "currency",
              "colorName",
              "colorHex",
              "stock",
              "description",
              "details",
              "images",
              "badge",
            ]),
            updatedAt: sql`now()`,
          },
        });
    }
  });

  const [categoryCount, productCount] = await Promise.all([
    db.$count(categories),
    db.$count(products),
  ]);
  console.log(`Seeded catalog: ${categoryCount} categories, ${productCount} products.`);
}

seed()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
