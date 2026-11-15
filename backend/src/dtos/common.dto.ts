import { z } from "zod";

// API contract shared by every endpoint. The frontend mirrors these shapes as
// plain TypeScript types; keep docs/api/api-contracts.md in sync when they change.

/** Machine-readable error codes returned in `ApiErrorBody.error.code`. */
export const ErrorCode = z.enum([
  "BAD_REQUEST",
  "VALIDATION_ERROR",
  "UNAUTHORIZED",
  "FORBIDDEN",
  "NOT_FOUND",
  "RATE_LIMITED",
  "INTERNAL_ERROR",
]);
export type ErrorCode = z.infer<typeof ErrorCode>;

/** Body of every unsuccessful response. */
export const ApiErrorBody = z.object({
  error: z.object({
    code: ErrorCode,
    message: z.string(),
    details: z.unknown().optional(),
  }),
});
export type ApiErrorBody = z.infer<typeof ApiErrorBody>;

/** Body of every successful response. `meta` is present only on list endpoints. */
export type ApiSuccess<T, M = never> = [M] extends [never]
  ? { data: T }
  : { data: T; meta: M };

export const PaginationMeta = z.object({
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
  total: z.number().int().nonnegative(),
});
export type PaginationMeta = z.infer<typeof PaginationMeta>;

/** URL-safe lowercase slug, e.g. `leather-biker-jacket`. */
export const Slug = z
  .string()
  .trim()
  .min(1)
  .max(100)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Invalid slug");

export const ImageDto = z.object({
  src: z.string(),
  alt: z.string(),
  /** CSS object-position for art-directed crops. Defaults to center. */
  position: z.string().optional(),
});
export type ImageDto = z.infer<typeof ImageDto>;
