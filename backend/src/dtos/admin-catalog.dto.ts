import { z } from "zod";

import type { Product } from "../models/product";
import type { CategoryWithCount } from "../models/category";
import { CategoryDto } from "./category.dto";
import { Slug } from "./common.dto";
import { ProductBadge, ProductDto, ProductGender, toProductDto } from "./product.dto";

/* --------------------------------------------------------------------------
   Shared input shapes
   -------------------------------------------------------------------------- */

/**
 * Images must be ones the storefront can render: files uploaded through
 * POST /admin/uploads (`/uploads/<uuid>.<ext>`) or Unsplash photos (the only
 * remote host allowed by next/image).
 */
const ImageSrc = z
  .string()
  .trim()
  .max(500)
  .regex(
    /^(\/uploads\/[0-9a-f-]{36}\.(jpg|png|webp|avif)|https:\/\/images\.unsplash\.com\/\S+)$/,
    "Use an uploaded image or an images.unsplash.com URL",
  );

export const ImageInput = z.object({
  src: ImageSrc,
  alt: z.string().trim().min(1, "Describe the image").max(200),
  position: z
    .string()
    .trim()
    .max(40)
    .regex(/^[\w\s.%-]*$/, "Use a CSS object-position such as 50% 30%")
    .optional()
    .transform((value) => (value ? value : undefined)),
});

const text = (max: number) => z.string().trim().min(1).max(max);

const ProductFields = z.object({
  name: text(120),
  styleNumber: text(40),
  categorySlug: Slug,
  /** Integer minor units (cents). */
  price: z.number().int().min(0).max(100_000_000),
  currency: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z]{3}$/, "Use a 3-letter currency code")
    .default("USD"),
  color: z.object({
    name: text(40),
    hex: z.string().trim().regex(/^#[0-9a-fA-F]{6}$/, "Use a hex color such as #1a2b3c"),
  }),
  description: text(2000),
  details: z.array(text(200)).max(20).default([]),
  images: z.array(ImageInput).min(1, "Add at least one image").max(8),
  badge: ProductBadge.nullable().default(null),
  gender: ProductGender.default("unisex"),
});

/* --------------------------------------------------------------------------
   Products
   -------------------------------------------------------------------------- */

export const AdminProductDto = ProductDto.extend({
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});
export type AdminProductDto = z.infer<typeof AdminProductDto>;

export const AdminProductListQuery = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(25),
  q: z
    .string()
    .trim()
    .max(100)
    .optional()
    .transform((value) => (value ? value : undefined)),
  category: Slug.optional(),
  stock: z.enum(["low", "out"]).optional(),
});

export const AdminProductParams = z.object({ slug: Slug });

/** The slug is chosen once: it is the product's URL and appears in orders. */
export const CreateProductBody = ProductFields.extend({
  slug: Slug,
  stock: z.number().int().min(0).max(100_000).default(0),
});
export type CreateProductBody = z.infer<typeof CreateProductBody>;

/** Every field optional; slug and stock can't be changed here. */
export const UpdateProductBody = ProductFields.partial()
  .extend({
    // `.partial()` keeps the defaults above; drop them so omitted means unchanged.
    currency: ProductFields.shape.currency.removeDefault().optional(),
    details: z.array(text(200)).max(20).optional(),
    badge: ProductBadge.nullable().optional(),
    gender: ProductGender.optional(),
  })
  .refine((body) => Object.keys(body).length > 0, "Change at least one field");
export type UpdateProductBody = z.infer<typeof UpdateProductBody>;

/**
 * Absolute stock with an optimistic check: `expectedStock` is the value the
 * admin saw. If an order changed it since, the update is refused (409).
 */
export const SetStockBody = z.object({
  stock: z.number().int().min(0).max(100_000),
  expectedStock: z.number().int().min(0),
});

export function toAdminProductDto(product: Product): AdminProductDto {
  return {
    ...toProductDto(product),
    createdAt: product.createdAt.toISOString(),
    updatedAt: product.updatedAt.toISOString(),
  };
}

/* --------------------------------------------------------------------------
   Categories
   -------------------------------------------------------------------------- */

export const AdminCategoryDto = CategoryDto.extend({
  sortOrder: z.number().int(),
  productCount: z.number().int().nonnegative(),
});
export type AdminCategoryDto = z.infer<typeof AdminCategoryDto>;

export const AdminCategoryParams = z.object({ slug: Slug });

export const CreateCategoryBody = z.object({
  slug: Slug,
  title: text(60),
  /** Without an image the category is hidden from the homepage grid. */
  image: ImageInput.nullable().default(null),
  sortOrder: z.number().int().min(0).max(1000).optional(),
});
export type CreateCategoryBody = z.infer<typeof CreateCategoryBody>;

export const UpdateCategoryBody = z
  .object({
    title: text(60).optional(),
    image: ImageInput.nullable().optional(),
    sortOrder: z.number().int().min(0).max(1000).optional(),
  })
  .refine((body) => Object.keys(body).length > 0, "Change at least one field");
export type UpdateCategoryBody = z.infer<typeof UpdateCategoryBody>;

export function toAdminCategoryDto(category: CategoryWithCount): AdminCategoryDto {
  return {
    slug: category.slug,
    title: category.title,
    image: category.image ?? null,
    sortOrder: category.sortOrder,
    productCount: category.productCount,
  };
}
