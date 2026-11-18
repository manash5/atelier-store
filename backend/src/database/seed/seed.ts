// Idempotent seed, safe to re-run; it never deletes rows.
//   npm run db:seed              inserts missing categories and products only,
//                                so admin edits (prices, stock, images) survive
//   npm run db:seed -- --reset   also overwrites seeded rows with the seed data
//                                (development only: undoes admin edits and sales)
// Then creates the admin from ADMIN_EMAIL and ADMIN_PASSWORD when both are set.

import { verifyPassword } from "better-auth/crypto";
import { and, eq, getTableColumns, inArray, sql, type SQL } from "drizzle-orm";
import type { PgTable } from "drizzle-orm/pg-core";

import { env } from "../../config/env";
import { auth } from "../../lib/auth";
import { db, pool } from "../index";
import { account, categories, products, user } from "../schema";
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

const RESET = process.argv.includes("--reset");

async function seed() {
  await db.transaction(async (tx) => {
    const categoryValues = seedCategories.map((category, index) => ({
      slug: category.slug,
      title: category.title,
      image: category.image,
      sortOrder: index,
    }));
    const insertCategories = tx.insert(categories).values(categoryValues);
    await (RESET
      ? insertCategories.onConflictDoUpdate({
          target: categories.slug,
          set: {
            ...excluded(categories, ["title", "image", "sortOrder"]),
            updatedAt: sql`now()`,
          },
        })
      : insertCategories.onConflictDoNothing());

    const categoryRows = await tx
      .select({ id: categories.id, slug: categories.slug })
      .from(categories)
      .where(inArray(categories.slug, seedCategories.map((category) => category.slug)));

    const categoryIds = new Map(categoryRows.map((row) => [row.slug, row.id]));

    // One statement per product keeps identity values in catalog order.
    for (const product of seedProducts) {
      const categoryId = categoryIds.get(product.category);
      if (categoryId === undefined) {
        throw new Error(`Unknown category "${product.category}" for ${product.slug}`);
      }

      const insertProduct = tx.insert(products).values({
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
      });
      await (RESET
        ? insertProduct.onConflictDoUpdate({
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
          })
        : insertProduct.onConflictDoNothing());
    }
  });

  const [categoryCount, productCount] = await Promise.all([
    db.$count(categories),
    db.$count(products),
  ]);
  console.log(
    `Seeded catalog (${RESET ? "reset seeded rows" : "missing rows only"}): ` +
      `${categoryCount} categories, ${productCount} products.`,
  );
}

/**
 * Ensures the ADMIN_EMAIL account exists (signed up through Better Auth so the
 * password is hashed the same way) and has the admin role.
 *
 * An existing account is promoted only if ADMIN_PASSWORD is its password:
 * otherwise anyone who registered that email first would become an admin.
 * Further admins are managed from the admin dashboard.
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
  } else if (existing.role !== "admin") {
    const credential = await db.query.account.findFirst({
      where: and(eq(account.userId, existing.id), eq(account.providerId, "credential")),
    });
    const owns =
      credential?.password != null &&
      (await verifyPassword({ hash: credential.password, password }));
    if (!owns) {
      console.warn(
        `Skipped admin: ${normalized} already exists and ADMIN_PASSWORD doesn't match it. ` +
          "Promote it from the admin dashboard instead.",
      );
      return;
    }
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
