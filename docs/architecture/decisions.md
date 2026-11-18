# Architecture decisions

Short records of decisions that shape the codebase. Add new entries at the end.

## ADR-001: Split into frontend and backend apps in one repository
**Status:** accepted (2026-11)

The catalog, and later carts, orders and auth, need a single owner of data and business rules that is independent of rendering.
- The Next.js app became `frontend/`.
- A new Express API became `backend/`.
- The two communicate only over REST.

Trade-offs:
- Each request adds a network hop.
- Frontend builds depend on a running backend.

## ADR-002: pnpm workspaces
**Status:** superseded by ADR-010 and ADR-011

Strict, non-hoisted dependencies stop the frontend from importing backend-only packages (`pg`, `express`, `drizzle-orm`) by accident. The root `package.json` has scripts only; every dependency is declared in `frontend/` or `backend/`.
- Turborepo is not used; root scripts are enough for two apps.
- Only `esbuild` may run install scripts (`allowBuilds` in `pnpm-workspace.yaml`).

## ADR-003: Shared Zod contracts package
**Status:** superseded by ADR-009

`@atelier/contracts` holds the request and response schemas and their inferred types.
- The backend validates requests with them and types its responses against them.
- The frontend imports **types only**.
- A breaking contract change fails `typecheck` in both apps.

This is the only shared code. It ships TypeScript source with no build step: Next uses `transpilePackages`, and the backend bundles it with tsup.

## ADR-004: Same-origin browser access through Next rewrites
**Status:** accepted

The browser calls `/api/v1/*` and `/api/auth/*` on the storefront domain, and `next.config.ts` rewrites them to `BACKEND_URL`.
- Auth cookies stay first-party.
- No cross-site cookie configuration is needed.
- The backend URL stays private.

CORS is still configured for direct callers.

## ADR-005: Better Auth runs in Express
**Status:** accepted

The backend owns the database, so it owns auth tables and sessions too. Better Auth officially supports Node/Express (`toNodeHandler`).

What changed:
- Removed the Next route handler, the `nextCookies()` plugin and the frontend's database access.
- The frontend keeps only a server-side session lookup. The React auth client (`better-auth/react`) will be added back with the sign-in UI.

## ADR-006: node-postgres driver instead of neon-http
**Status:** accepted

A long-running Express server benefits from a connection pool, and interactive transactions (`db.transaction`) will be needed for orders. Use Neon's **pooled** connection string. The pool size is set with `DATABASE_POOL_MAX`.

## ADR-007: Prices in integer minor units; stock status derived
**Status:** accepted

- `products.price` is stored as an integer number of cents. This avoids floating-point errors and a later migration.
- Stock is a single integer per product until variants exist.
- `stockStatus` (`in-stock`, `low-stock` at 3 or fewer, `sold-out`) is computed in the backend (`models/product.ts`) and returned in the DTO, never stored.

## ADR-008: Curated homepage selections stay in frontend content
**Status:** accepted

The New Arrivals and Gift Edit lists are editorial choices. They live as slug arrays in `modules/home/content.ts` and are fetched with `GET /products?slugs=…`, which preserves their order. They can move to a collections table once merchandising tools exist.

## ADR-009: No shared packages; each app owns its side of the contract
**Status:** accepted (supersedes ADR-003)

The repository contains only `frontend/` and `backend/`, and each declares exactly the dependencies it uses. The `packages/contracts` workspace was removed.
- The backend owns the API contract as Zod schemas in `src/dtos/`.
- The frontend mirrors the response shapes as plain TypeScript types, so no Zod ships to the browser.
- `docs/api/api-contracts.md` is the reference both sides follow.

Trade-off: the frontend types can drift from the backend. To limit this:
- Backend API tests validate every response against the Zod DTOs.
- Contract changes follow the checklist in `api-contracts.md`.

## ADR-010: Standalone apps instead of a pnpm workspace
**Status:** accepted (supersedes ADR-002); package manager changed by ADR-011

`frontend/` and `backend/` are independent pnpm projects. Each has its own `package.json`, `pnpm-lock.yaml` and `node_modules`, and the repository root has no package files at all.
- Each app installs, builds and deploys from its own folder, and can only resolve the dependencies it declares.
- pnpm settings live per app. `backend/pnpm-workspace.yaml` holds settings only (`allowBuilds: esbuild`); it is not a multi-package workspace.

Trade-offs:
- There are no root-level commands. Run install, dev, build and checks inside each folder.
- Tools both apps use (TypeScript, ESLint) are installed twice.

## ADR-011: npm instead of pnpm
**Status:** accepted

pnpm 12 could not be installed reliably on the Windows development machine: its native binary was never installed, so the `pnpm` command didn't work. Both apps now use npm, which ships with Node.
- Each app has its own `package-lock.json` and `node_modules`.
- npm blocks dependency install scripts by default. The backend approves only esbuild, recorded under `allowScripts` in `backend/package.json`.

Trade-off: npm hoists dependencies, so an app could import a package it doesn't declare. Code review and typecheck should catch this; declare every import in the app's `package.json`.

## ADR-012: Gender is a product attribute; gifts are a curated list
**Status:** accepted

The storefront needs Women, Men and Gifts pages next to the category pages.
- A product has exactly one category (Shoes, Bags…), but Women and Men cut across categories. So gender is a column on `products` (`women`, `men`, `unisex`), not a category. `GET /products?gender=` returns that gender plus unisex products, and can be combined with `category`.
- Women, Men and Gifts are static routes (`/collections/women`, `/men`, `/gifts`), which take precedence over the `/collections/[slug]` category route.
- Gifts is an editorial selection, not a product property. It stays a curated slug list (`frontend/src/modules/products/content.ts`), shared by the Gifts page and the homepage Gift Edit, until a collections API or CMS exists.

Trade-off: a product can't be both women's and men's except as `unisex`; kids or more audiences would need a new enum value and migration.

## ADR-013: JWT access tokens from Better Auth, cookies owned by the storefront
**Status:** accepted (extends ADR-004 and ADR-005)

Better Auth stays the account and session system (email + password), with two plugins:
- `jwt` issues short-lived (15 min) EdDSA access tokens from `GET /api/auth/token`, with `role` in the claims, and publishes its public keys at `/api/auth/jwks`.
- `admin` adds `role` (`user` default, `admin`) and ban fields to users.

`/api/v1` is authorized only by `Authorization: Bearer <jwt>` (`authorize` and `authorizeAdmin` in `backend/src/middleware/auth.middleware.ts`); the session cookie is only used against `/api/auth/*`. The backend verifies tokens locally with the keys in its `jwks` table.

The storefront owns the cookies (`frontend/src/shared/lib/auth-cookies.ts`): sign-in/up run as server actions that re-set Better Auth's session cookie on the storefront origin and store the JWT in an httpOnly `atelier.access_token` cookie. `frontend/src/proxy.ts` guards pages and refreshes expired JWTs from the session cookie, forwarding the new token to the same render.

Trade-offs:
- A role change or ban reaches `/api/v1` only when the current token expires (≤ 15 min); `/me` also re-reads the user and rejects banned accounts.
- Tokens never reach browser JavaScript, so Client Components that need auth must go through server actions (or a future route handler) rather than `browserApi`.

## ADR-014: Uploads on local disk via multer
**Status:** accepted

`POST /api/v1/admin/uploads` stores one image (JPEG, PNG, WebP, AVIF; ≤ 5 MB) with multer (`backend/src/middleware/upload.middleware.ts`) in `UPLOAD_DIR` under a random UUID name, and Express serves the folder at `/uploads` (proxied by the storefront rewrite). Auth middleware runs before multer, so rejected requests never write to disk.

Trade-off: files live on the API host's disk, so they don't survive an ephemeral host or scale across instances. Move to object storage (S3, R2, Cloudinary) before production; only the middleware's storage engine and the returned URL should change.

## ADR-015: Server-side carts, orders with atomic stock, simulated payment
**Status:** accepted (the design update required before adding carts and orders)

- **Signed-in only.** Adding to the bag requires an account: guests are sent to sign in and return to the product. There is no guest cart to merge.
- **One cart per user, in the database** (`cart_items`: user, product, quantity). The bag always shows live prices and stock. Each line carries an `issue` (`sold-out`, `insufficient-stock`) when stock has dropped below its quantity, and checkout is blocked until the shopper fixes it. Lines are never changed silently.
- **Stock is enforced twice:** when adding or raising a quantity (409 `CONFLICT` with a clear message), and atomically when the order is placed, with a conditional `UPDATE … WHERE stock >= qty` per line inside one transaction, so concurrent orders can't oversell. Stock is only ever decremented there.
- **Orders snapshot** name, colour, image and unit price in `order_items`, so they stay correct when the catalog changes.
- **Payments are simulated.** The checkout form validates card details on the storefront server (Luhn, expiry, CVC) and sends only the last four digits; every placed order is `paid`. A real provider (e.g. Stripe) would replace this step and confirm payment before stock is decremented.
- After an order, the storefront calls `updateTag("catalog")` so product pages show the new stock immediately.

Trade-offs: the bag doesn't reserve stock, so an item can sell out between adding and paying (the shopper sees why). There are no cancellations, refunds or emails yet.

## ADR-016: Admin dashboard
**Status:** accepted (extends ADR-013 and ADR-015)

The admin side manages the catalog, stock, orders and admin access. It is built on the existing `/api/v1/admin` router, not a parallel mechanism.

- **Access:** `authorize` checks the token's `role` claim, then `authorizeAdmin` re-reads the user (`role === "admin"`, not banned) on every admin request. Demotions and bans take effect immediately on admin routes, not after the 15-minute token lifetime. Better Auth's built-in `/api/auth/admin/*` endpoints (impersonation, password resets, deletion, role changes) are disabled; nothing used them.
- **Admins are managed in the dashboard.** Admins can't remove their own access, and the last admin can't be demoted. The seed only creates the first admin, and it promotes an existing account only if `ADMIN_PASSWORD` is that account's password.
- **Catalog:** products and categories can be created and edited, never deleted. Slugs are fixed at creation, because they are URLs, cache tags and order snapshots.
- **Stock:** admins set an exact number with an optimistic check (`expectedStock`). If an order changed the stock meanwhile, the save is refused (409), so a sale is never overwritten. This and order cancellation are the only places besides checkout that change stock (this supersedes ADR-015's "only ever decremented").
- **Orders:** `paid → processing → shipped → delivered`, and `cancelled` from paid or processing only. Status changes are conditional on the status that was read, so double submissions can't apply twice. Cancelling restocks every item whose product still exists, in the same transaction.
- **Seed:** `db:seed` now only inserts missing rows, so admin edits and sales survive a re-run. `db:seed -- --reset` restores seeded rows (development only).
- **Writes:** every admin write is audit-logged through the request logger, and storefront server actions expire the `catalog` cache tag after catalog, stock and cancellation changes.

Trade-offs:
- There's no stock history or reason codes, and no durable audit table (logs only).
- Deleting a user still cascades to their orders. The dashboard doesn't delete users, but the database rule is unchanged.
- Customers aren't notified of status changes (no email yet).

## ADR-017: Public appointment requests
**Status:** accepted

The booking page (`/services/appointments`) lets anyone, signed in or not, leave their name, email and phone (plus in-store/video, an optional date and a note) so a client advisor can call back. It is the first public write endpoint.

- `POST /api/v1/appointments` needs no token. `optionalAuthorize` links the request to the account when a valid bearer token is sent and ignores an invalid one.
- Spam control: `appointmentRateLimit` allows 5 requests per IP per 15 minutes. The storefront submits from a server action, so it forwards the visitor's `X-Forwarded-For`; otherwise every visitor would share the storefront server's IP.
- The response is a receipt (id, type, date), never the stored contact details.
- Requests are handled in the admin portal (`/admin/appointments`): search, filter and mark `contacted`. The overview shows how many are `new`.

Trade-offs: no confirmation email, calendar booking or CAPTCHA yet; per-IP limits can be shared behind corporate NATs.
