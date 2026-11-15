import { z } from "zod";

import { deriveStockStatus, type Product } from "../models/product";
import { CategorySummaryDto } from "./category.dto";
import { type ApiSuccess, ImageDto, PaginationMeta, Slug } from "./common.dto";

/* --------------------------------------------------------------------------
   Response shapes
   -------------------------------------------------------------------------- */

/** Derived from `stock`; never stored. */
export const StockStatus = z.enum(["in-stock", "low-stock", "sold-out"]);
export type StockStatus = z.infer<typeof StockStatus>;

export const ProductBadge = z.enum(["New", "Limited"]);

export const MoneyDto = z.object({
  /** Integer minor units (cents for USD). */
  amount: z.number().int().nonnegative(),
  /** ISO 4217 code. */
  currency: z.string().length(3),
});

export const ProductDto = z.object({
  slug: Slug,
  name: z.string(),
  styleNumber: z.string(),
  category: CategorySummaryDto,
  price: MoneyDto,
  color: z.object({ name: z.string(), hex: z.string() }),
  /** Units available to sell. */
  stock: z.number().int().nonnegative(),
  stockStatus: StockStatus,
  description: z.string(),
  details: z.array(z.string()),
  /** First image is the primary/listing image. */
  images: z.tuple([ImageDto], ImageDto),
  badge: ProductBadge.nullable(),
});
export type ProductDto = z.infer<typeof ProductDto>;

export type ProductResponse = ApiSuccess<ProductDto>;
export type ProductListResponse = ApiSuccess<ProductDto[], PaginationMeta>;

/* --------------------------------------------------------------------------
   Request shapes
   -------------------------------------------------------------------------- */

export const MAX_SLUGS_PER_REQUEST = 24;
export const MAX_PAGE_SIZE = 100;

export const ProductSlugParams = z.object({ slug: Slug });

/** Order of a catalog page: insertion order, or most recently added first. */
export const ProductSort = z.enum(["catalog", "newest"]);
export type ProductSort = z.infer<typeof ProductSort>;

/**
 * `GET /products`. With `slugs` (comma-separated), returns exactly those
 * products in the given order (`sort` and `category` are ignored); otherwise
 * returns a page of the catalog in `sort` order, optionally limited to one
 * `category` (an unknown category gives an empty page).
 */
export const ListProductsQuery = z.object({
  slugs: z
    .string()
    .transform((value) =>
      value
        .split(",")
        .map((slug) => slug.trim())
        .filter(Boolean),
    )
    .pipe(z.array(Slug).min(1).max(MAX_SLUGS_PER_REQUEST))
    .optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(MAX_PAGE_SIZE).default(24),
  sort: ProductSort.default("catalog"),
  category: Slug.optional(),
});

export const RelatedProductsQuery = z.object({
  limit: z.coerce.number().int().min(1).max(12).default(4),
});

/* --------------------------------------------------------------------------
   Mapper
   -------------------------------------------------------------------------- */

export function toProductDto(product: Product): ProductDto {
  return {
    slug: product.slug,
    name: product.name,
    styleNumber: product.styleNumber,
    category: { slug: product.category.slug, title: product.category.title },
    price: { amount: product.price, currency: product.currency },
    color: { name: product.colorName, hex: product.colorHex },
    stock: product.stock,
    stockStatus: deriveStockStatus(product.stock),
    description: product.description,
    details: product.details,
    images: product.images,
    badge: product.badge,
  };
}
