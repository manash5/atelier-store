# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

Next.js 16 (App Router, `src/` dir, Turbopack) ecommerce app: TypeScript, Tailwind CSS v4, Better Auth, Drizzle ORM, Neon Postgres. Built so far: homepage (`/`) and product detail pages (`/products/[slug]`). No schema tables, cart, or auth methods yet. `/collections/*` and footer pages don't exist yet, so links to them 404.

## Catalog data

All storefront content is static sample data in `src/lib/catalog.ts` (Unsplash images, allowed via `images.remotePatterns` in `next.config.ts`). It is shaped like the eventual DB query results, so swapping the source should not require component changes.

- `products` is the single product list; `getProduct(slug)`, `getRelatedProducts()`, and the homepage selections (`newArrivals`, `giftEdit`) all read from it. `images[0]` is the listing image.
- Stock status is derived, never stored: `getStockStatus(product)` maps `stock` to `in-stock` / `low-stock` (≤ `LOW_STOCK_THRESHOLD`) / `sold-out`. Product cards, the PDP stock line, the PDP buttons, and the JSON-LD `availability` all use it.
- When adding sample images, use only unbranded photos (no visible logos or labels, including at PDP size). `unsplashDetail()` makes 4:5 focal-point close-ups from an existing photo.

## Product detail page

`src/app/products/[slug]/page.tsx` prerenders every product via `generateStaticParams` (Cache Components requires at least one param; `dynamicParams` is unavailable). Await `params` only inside the `<Suspense>`-wrapped `ProductDetails` component, never in the page itself: awaiting it at the top level triggers Next's dev warning "URL data outside of Suspense", because navigations can't render instantly. Apply the same pattern to future dynamic routes (e.g. `/collections/[slug]`). Unknown slugs call `notFound()`, which renders `src/app/not-found.tsx` with HTTP **200** + `noindex`: the Cache Components shell has already started streaming. A true 404 status would need a slug check in `proxy.ts`. The "Add to bag" button is a placeholder until the cart exists.

## Commands

```bash
npm run dev            # dev server (http://localhost:3000)
npm run build          # production build
npm run lint           # ESLint (flat config, eslint.config.mjs)
npm run typecheck      # tsc --noEmit
npm run auth:generate  # Better Auth CLI → writes auth tables to src/db/schema.ts
npm run db:generate    # drizzle-kit: create SQL migration in ./drizzle
npm run db:migrate     # apply migrations
npm run db:push        # push schema directly (no migration files)
npm run db:studio      # Drizzle Studio
```

No test framework is set up yet.

Env vars go in `.env.local` (template: `.env.example`). `DATABASE_URL` is required: `src/db/index.ts` and `drizzle.config.ts` throw at load time without it, so `next build` also needs it set (a dummy value is fine for build-only checks).

## Architecture

- **Next.js version**: this is Next 16, which has breaking changes from older versions (e.g. `middleware.ts` is now `proxy.ts`, route `params` are Promises). Check `node_modules/next/dist/docs/` before writing Next-specific code.
- **Database**: `src/db/index.ts` exports a single `db` built with `drizzle-orm/neon-http` (Neon's HTTP driver, no interactive transactions). All of `src/db/schema.ts` is passed to it, so tables exported there are available to the relational query API (`db.query.*`).
- **Auth**: `src/lib/auth.ts` is the server-side Better Auth instance, backed by the Drizzle adapter (`provider: "pg"`). It is mounted at `/api/auth/*` by `src/app/api/auth/[...all]/route.ts`. Client components use `authClient` from `src/lib/auth-client.ts` (base URL from `NEXT_PUBLIC_APP_URL`). The `nextCookies()` plugin must stay **last** in the `plugins` array so cookies get set from server actions. Server-side session lookup: `auth.api.getSession({ headers: await headers() })`.
- **Schema generation flow**: after changing Better Auth config (adding providers or plugins), run `auth:generate` and then `db:generate`/`db:push`. `auth:generate` writes to `src/db/schema.ts`, so keep app tables in separate files under `src/db/` and re-export them from `schema.ts`, or they may be overwritten.
- `src/db/index.ts` and `src/lib/auth.ts` import `server-only`. Never import them from client components.
- Path alias: `@/*` → `src/*`.

## Design system

All tokens and primitives live in `src/app/globals.css` (Tailwind v4, CSS-first, no `tailwind.config`). Fonts are loaded in `src/app/layout.tsx` via `next/font` (Inter → `font-sans`, Bodoni Moda → `font-display`).

- **The default Tailwind color palette and radius scale are removed** (`--color-*: initial`, `--radius-*: initial`). Classes like `bg-zinc-100` or `rounded-md` generate nothing. Use the tokens: `canvas`, `surface`, `surface-strong`, `ink`, `ink-soft`, `ink-muted`, `ink-subtle`, `line`, `line-strong`, `sale`, `success`, `overlay`. Corners are square; only `rounded-full` exists.
- A bare `border`/`border-b` is a hairline in `line` color (set in the base layer).
- Text: use the `type-*` utilities (`type-display-xl`, `type-display`, `type-heading`, `type-title`, `type-body-lg`, `type-body`, `type-caption`, `type-label`, `type-micro`). They set family, size, leading, tracking, and case but never color. Serif display is for large headings only; all UI text is sans, and labels/buttons/nav are uppercase `type-label`.
- Layout: `container-page|content|prose|form` for width, plus responsive spacing tokens `gutter`, `section`, `section-sm`, `header`, `announcement` (e.g. `px-gutter`, `py-section`, `top-header`). Change their values per breakpoint in the base-layer `:root` block, not in components. `h-hero` fills the first screen below the announcement bar and header. Grids: `grid-page` (4/8/12 cols), `grid-products` (2/3/4 cols, for full listing pages), `rail` (snap carousel); the `ProductGrid` component is the single 4-product row (2×2 → 1×4) used for curated/related sets. Images: `media-frame` + `aspect-product|portrait|landscape`.
- Buttons: `btn` + `btn-primary|secondary|inverse|ghost` (+ `btn-sm|lg|icon`). Variants and sizes only set `--btn-*` custom properties, so keep it that way when adding new ones. Links: `link` (inline underlined), `link-quiet` (nav/footer), `link-muted`. Inputs: `input-base`.
- Light theme only (`color-scheme: light`); there is no dark mode.
