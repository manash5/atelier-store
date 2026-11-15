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
