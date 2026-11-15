# API contracts

- Base path: `/api/v1`.
- This document is the contract between the apps, which share no code. The backend defines it as Zod schemas in `backend/src/dtos/*.dto.ts`. The frontend mirrors the response shapes as plain TypeScript types in `frontend/src/shared/types/api.ts` and each module's `types.ts`.
- All responses are JSON.
- Every endpoint below was added because a current page uses it.

## Envelope

```jsonc
// success
{ "data": <T>, "meta": { "page": 1, "limit": 24, "total": 12 } }   // meta only on lists

// error
{ "error": { "code": "NOT_FOUND", "message": "Product \"x\" not found", "details": [...] } }
```

| Error code | HTTP status |
|---|---|
| `VALIDATION_ERROR` | 400 (`details`: `[{ path, message }]`) |
| `BAD_REQUEST` | 400 (malformed body) |
| `UNAUTHORIZED` | 401 |
| `FORBIDDEN` | 403 |
| `NOT_FOUND` | 404 |
| `RATE_LIMITED` | 429 |
| `INTERNAL_ERROR` | 500 |

Every response carries an `x-request-id` header. A request id the client sends is reused.

## Endpoints

| Method and path | Query | Response | Used by |
|---|---|---|---|
| `GET /api/v1/products` | `slugs=a,b,c` (1–24 slugs) | `ProductDto[]` in the requested order. Unknown slugs are omitted | Homepage New Arrivals, Gift Edit |
| `GET /api/v1/products` | `page` (≥1, default 1), `limit` (1–100, default 24) | `ProductDto[]` + `meta`, in catalog order | `generateStaticParams` |
| `GET /api/v1/products/:slug` | — | `ProductDto`, or 404 | Product page and metadata |
| `GET /api/v1/products/:slug/related` | `limit` (1–12, default 4) | `ProductDto[]`: same category first, then catalog order; excludes the product | "You May Also Like" |
| `GET /api/v1/categories` | — | `CategoryDto[]` ordered by `sort_order` | Homepage category grid |
| `GET /health` | — | `{ status: "ok", database: "ok" }` | Deploy health checks |
| `ALL /api/auth/*` | — | Better Auth (e.g. `GET /api/auth/get-session`) | Auth client, server session lookup |

`GET /api/v1/categories/:slug` is deferred until a `/collections/[slug]` page exists. Each product already embeds its category.

Slugs must match `^[a-z0-9]+(-[a-z0-9]+)*$` (max 100 characters). Anything else gets a 400.

## DTOs

```ts
type ImageDto = { src: string; alt: string; position?: string };

type ProductDto = {
  slug: string;
  name: string;
  styleNumber: string;
  category: { slug: string; title: string };
  price: { amount: number /* integer minor units */; currency: string /* ISO 4217 */ };
  color: { name: string; hex: string };
  stock: number;
  stockStatus: "in-stock" | "low-stock" | "sold-out"; // derived: ≤0 sold-out, ≤3 low-stock
  description: string;
  details: string[];
  images: [ImageDto, ...ImageDto[]]; // first = listing image
  badge: "New" | "Limited" | null;
};

type CategoryDto = { slug: string; title: string; image: ImageDto | null };
```

## Changing a contract

1. Update this document.
2. Edit the Zod schema and mapper in `backend/src/dtos/*.dto.ts`. The backend API tests validate responses against these schemas.
3. Update the mirrored frontend types (`shared/types/api.ts`, `modules/*/types.ts`) and their consumers.
4. Run `npm run typecheck` in both apps and `npm test` in `backend/`.
5. Prefer additive changes. A breaking change to a published field needs a new path version (`/api/v2`).
