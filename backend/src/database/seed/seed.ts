// Idempotent seed: upserts categories and products by slug inside one
// transaction, then creates/promotes the admin from ADMIN_EMAIL and
// ADMIN_PASSWORD when both are set. Safe to re-run; it never deletes rows.
//   npm run db:seed

import { eq, getTableColumns, sql, type SQL } from "drizzle-orm";
import type { PgTable } from "drizzle-orm/pg-core";

import { env } from "../../config/env";
import { auth } from "../../lib/auth";
import { db, pool } from "../index";
import { categories, products, user } from "../schema";
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
          gender: product.gender,
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
              "gender",
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

/**
 * Ensures the ADMIN_EMAIL account exists (signed up through Better Auth so the
 * password is hashed the same way) and has the admin role. An existing
 * account's password is left unchanged.
 */
async function seedAdmin() {
  const { ADMIN_EMAIL: email, ADMIN_PASSWORD: password } = env;
  if (!email || !password) {
    console.log("Skipped admin: set ADMIN_EMAIL and ADMIN_PASSWORD to create one.");
    return;
  }

  const normalized = email.toLowerCase();
  const existing = await db.query.user.findFirst({ where: eq(user.email, normalized) });
  if (!existing) {
    await auth.api.signUpEmail({ body: { email: normalized, password, name: "Atelier Admin" } });
  }
  await db.update(user).set({ role: "admin" }).where(eq(user.email, normalized));
  console.log(`Admin ready: ${normalized}${existing ? " (existing account)" : ""}.`);
}

seed()
  .then(seedAdmin)
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
