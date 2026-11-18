# API contracts

- Base path: `/api/v1`.
- This document is the contract between the apps, which share no code. The backend defines it as Zod schemas in `backend/src/dtos/*.dto.ts`. The frontend mirrors the response shapes as plain TypeScript types in `frontend/src/shared/types/api.ts` and each module's `types.ts`.
- All responses are JSON.
- Every endpoint below was added because a current page uses it.

## Envelope

```jsonc
// success
{ "data": <T>, "meta": { "page": 1, "limit": 24, "total": 27 } }   // meta only on lists

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
| `CONFLICT` | 409 (e.g. not enough stock; `details` may list the affected products) |
| `RATE_LIMITED` | 429 |
| `INTERNAL_ERROR` | 500 |

Every response carries an `x-request-id` header. A request id the client sends is reused.

## Endpoints

| Method and path | Query | Response | Used by |
|---|---|---|---|
| `GET /api/v1/products` | `slugs=a,b,c` (1–24 slugs) | `ProductDto[]` in the requested order. Unknown slugs are omitted | Homepage New Arrivals, Gift Edit, Gifts page |
| `GET /api/v1/products` | `page` (≥1, default 1), `limit` (1–100, default 24), `sort` (`catalog` default, or `newest`), `category` (category slug, optional), `gender` (`women` or `men`, optional) | `ProductDto[]` + `meta`. `catalog`: insertion order. `newest`: `created_at` descending, ties broken by newest id. `category` limits the page and `meta.total` to that category; an unknown category gives an empty page. `gender` limits them to that gender **plus unisex** products, and combines with `category`. `sort`, `category` and `gender` are ignored with `slugs` | `generateStaticParams` (`catalog`), New Arrivals page (`newest`), category pages (`category`), Women and Men pages (`gender`) |
| `GET /api/v1/products/:slug` | — | `ProductDto`, or 404 | Product page and metadata |
| `GET /api/v1/products/:slug/related` | `limit` (1–12, default 4) | `ProductDto[]`: same category first, then catalog order; excludes the product | "You May Also Like" |
| `GET /api/v1/categories` | — | `CategoryDto[]` ordered by `sort_order` | Homepage category grid, category page static params |
| `GET /api/v1/categories/:slug` | — | `CategoryDto`, or 404 | Category page and metadata |
| `GET /health` | — | `{ status: "ok", database: "ok" }` | Deploy health checks |
| `GET /api/v1/me` | — | `MeDto`. **Bearer token required**; 401 if missing/invalid or the account is gone | Account page |
| `POST /api/v1/admin/uploads` | — (multipart, one file in field `image`: JPEG, PNG, WebP or AVIF, ≤ 5 MB) | **201** `UploadDto`. **Admin bearer token required**: 401 without a valid token, 403 for non-admins, 400 `VALIDATION_ERROR` for a missing, wrong-type or oversized file | Admin upload page |
| `GET /api/v1/cart` | — | `CartDto`. **Bearer token required** (all cart and order routes) | Bag page, checkout, account page |
| `GET /api/v1/cart/count` | — | `{ count }` (total units) | Header bag badge |
| `POST /api/v1/cart/items` | body `{ productSlug, quantity? (1–10, default 1) }` | `CartDto`. Adds to an existing line. 404 unknown product; 409 sold out, or the new quantity exceeds stock (or 10) | "Add to bag" |
| `PATCH /api/v1/cart/items/:slug` | body `{ quantity (1–10) }` | `CartDto`. 404 if not in the bag; 409 when **raising** above stock (lowering is always allowed) | Bag quantity picker |
| `DELETE /api/v1/cart/items/:slug` | — | `CartDto`. 404 if not in the bag | Bag "Remove" |
| `POST /api/v1/orders` | body `{ shippingAddress: ShippingAddressDto, payment: { cardLast4: "dddd" } }` | **201** `OrderDto`. Reserves stock, creates the order and empties the bag in one transaction. 400 empty bag; 409 when any line is sold out or short (`details: [{ path: slug, message: name }]`) | Checkout |
| `GET /api/v1/orders` | — | `OrderDto[]`, newest first (max 10) | Account page "Recent orders" |
| `GET /api/v1/orders/:number` | — | `OrderDto`. 404 unless it is the caller's order | Order confirmation |
| `GET /uploads/:file` | — | The stored file (static, immutable cache) | Uploaded images |
| `ALL /api/auth/*` | — | Better Auth (see Authentication) | Sign-in/up server actions, proxy token refresh |

Slugs must match `^[a-z0-9]+(-[a-z0-9]+)*$` (max 100 characters). Anything else gets a 400.

## Authentication

Better Auth (email + password) owns accounts and sessions at `/api/auth/*`; its responses are Better Auth's own, not the envelope (errors are `{ code, message }`). Endpoints in use:

| Endpoint | Purpose |
|---|---|
| `POST /api/auth/sign-up/email` `{ name, email, password }` | Create an account and a session (sets the session cookie). 422 if the email exists, 400 for a short (< 8) or long (> 128) password |
| `POST /api/auth/sign-in/email` `{ email, password, rememberMe }` | Start a session. 401 for wrong credentials |
| `POST /api/auth/sign-out` | Revoke the session |
| `GET /api/auth/token` | Exchange the session cookie for a JWT access token: `{ token }` |
| `GET /api/auth/jwks` | Public keys (EdDSA) that verify access tokens |

`/api/v1` routes that need a user take `Authorization: Bearer <access token>`:
- Access tokens are JWTs signed by the Better Auth `jwt` plugin, valid for **15 minutes**. `iss` and `aud` are `BETTER_AUTH_URL`; claims are `sub` (user id), `email`, `name`, `role` (`"user"` or `"admin"`).
- The backend's `authorize` middleware returns 401 `UNAUTHORIZED` with message `Authentication required` (no header), `Malformed authorization header` (not `Bearer <token>`) or `Invalid or expired token`. `authorizeAdmin` returns 403 `FORBIDDEN` (`Admin access required`).
- A role change takes effect when the next token is issued (≤ 15 minutes).

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
  gender: "women" | "men" | "unisex";
};

type CategoryDto = { slug: string; title: string; image: ImageDto | null };

type CartLineDto = {
  product: {
    slug: string; name: string; color: { name: string; hex: string };
    image: ImageDto; price: Money; stock: number;
    stockStatus: "in-stock" | "low-stock" | "sold-out";
  };
  quantity: number;
  maxQuantity: number; // min(stock, 10); 0 when sold out
  lineTotal: Money;
  issue: "sold-out" | "insufficient-stock" | null; // live check against stock
};

type CartDto = { items: CartLineDto[]; itemCount: number; subtotal: Money; hasIssues: boolean };

type ShippingAddressDto = {
  fullName: string; line1: string; line2?: string; city: string;
  postalCode: string; country: string; phone?: string;
};

type OrderDto = {
  number: string; // "AT-" + 8 characters
  status: "paid" | "cancelled";
  createdAt: string;
  email: string; // from the access token
  shippingAddress: ShippingAddressDto;
  items: { productSlug: string; name: string; colorName: string; image: ImageDto;
           unitPrice: Money; quantity: number; lineTotal: Money }[];
  itemCount: number;
  subtotal: Money; shipping: Money; total: Money; // shipping is complimentary (0)
  payment: { method: "card"; last4: string | null }; // simulated
};

type MeDto = {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image: string | null;
  role: "user" | "admin";
  createdAt: string; // ISO 8601
};

type UploadDto = {
  url: string; // e.g. "/uploads/<uuid>.png", served by the backend and the storefront rewrite
  filename: string;
  size: number; // bytes
  mimeType: string;
};
```

## Changing a contract

1. Update this document.
2. Edit the Zod schema and mapper in `backend/src/dtos/*.dto.ts`. The backend API tests validate responses against these schemas.
3. Update the mirrored frontend types (`shared/types/api.ts`, `modules/*/types.ts`) and their consumers.
4. Run `npm run typecheck` in both apps and `npm test` in `backend/`.
5. Prefer additive changes. A breaking change to a published field needs a new path version (`/api/v2`).
