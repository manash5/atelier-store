// Response envelope of the backend REST API. Hand-written mirror of the
// contract in docs/api/api-contracts.md (the backend validates against its own
// Zod DTOs). Update both together.

export type ErrorCode =
  | "BAD_REQUEST"
  | "VALIDATION_ERROR"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "RATE_LIMITED"
  | "INTERNAL_ERROR";

/** Body of every unsuccessful response. */
export type ApiErrorBody = {
  error: { code: ErrorCode; message: string; details?: unknown };
};

export type PaginationMeta = { page: number; limit: number; total: number };

/** Body of every successful response. `meta` is present only on list endpoints. */
export type ApiSuccess<T, M = never> = [M] extends [never]
  ? { data: T }
  : { data: T; meta: M };

/** Integer minor units (cents for USD) plus an ISO 4217 currency code. */
export type Money = { amount: number; currency: string };
