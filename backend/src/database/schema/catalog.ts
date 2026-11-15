import { relations, sql } from "drizzle-orm";
import {
  check,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

/** Ordered image entry stored in jsonb columns. */
export type ImageData = {
  src: string;
  alt: string;
  /** CSS object-position for art-directed crops. */
  position?: string;
};

const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
};

export const productBadge = pgEnum("product_badge", ["New", "Limited"]);

export const categories = pgTable("categories", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  /** Optional tile image for category listings. */
  image: jsonb("image").$type<ImageData>(),
  sortOrder: integer("sort_order").notNull().default(0),
  ...timestamps,
});

export const products = pgTable(
  "products",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    slug: text("slug").notNull().unique(),
    categoryId: integer("category_id")
      .notNull()
      .references(() => categories.id, { onDelete: "restrict" }),
    name: text("name").notNull(),
    styleNumber: text("style_number").notNull().unique(),
    /** Integer minor units of `currency` (cents for USD). */
    price: integer("price").notNull(),
    currency: text("currency").notNull().default("USD"),
    colorName: text("color_name").notNull(),
    colorHex: text("color_hex").notNull(),
    /** Units available to sell. Stock status is derived from it, never stored. */
    stock: integer("stock").notNull().default(0),
    description: text("description").notNull(),
    details: text("details")
      .array()
      .notNull()
      .default(sql`'{}'::text[]`),
    /** Ordered; the first image is the listing image. */
    images: jsonb("images").$type<[ImageData, ...ImageData[]]>().notNull(),
    badge: productBadge("badge"),
    ...timestamps,
  },
  (table) => [
    index("products_category_id_idx").on(table.categoryId),
    check("products_price_nonnegative", sql`${table.price} >= 0`),
    check("products_stock_nonnegative", sql`${table.stock} >= 0`),
    check(
      "products_images_nonempty_array",
      sql`jsonb_typeof(${table.images}) = 'array' AND jsonb_array_length(${table.images}) > 0`,
    ),
  ],
);

export const categoriesRelations = relations(categories, ({ many }) => ({
  products: many(products),
}));

export const productsRelations = relations(products, ({ one }) => ({
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
}));
