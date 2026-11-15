# CLAUDE.md (frontend)

@AGENTS.md

This is the Next.js 16 storefront (App Router, `src/` dir, Turbopack, Cache Components), using TypeScript, Tailwind CSS v4 and Axios. Architecture: `../docs/architecture/frontend-architecture.md`.

- Built so far: homepage (`/`), product detail pages (`/products/[slug]`), New Arrivals (`/collections/new-in`, the 24 newest products via `sort=newest`) and category pages (`/collections/[slug]`, one per catalog category).
- `/collections/<slug>` for anything that isn't a category (e.g. `women`, `gifts`, `resort-2027`) and the footer pages don't exist yet, so links to them show the not-found page.
- Listing pages render `ProductListingPage` (header, count, `ProductListing` grid on `grid-products`, empty state) with `ProductListingSkeleton` as their Suspense fallback.
- Path alias: `@/*` → `src/*`.

## Commands

`npm run dev`, `npm run build`, `npm run lint`, `npm run typecheck` (runs `next typegen` first). There are no frontend tests yet.

`next build` prerenders every product from the API, so the backend must be running, migrated and seeded, with `BACKEND_URL` pointing at it. If the backend is unreachable, the build fails with "API unreachable".

## Module rules (ESLint-enforced)

- `src/app/` is **routing only**: params, metadata, `generateStaticParams`, Suspense, `notFound()`. Feature code lives in `src/modules/<feature>/`; generic code lives in `src/shared/`.
- Import other modules only through `@/modules/<name>` (UI and types) or `@/modules/<name>/server` (server-only data access). Never deep-import, and use relative imports inside a module.
- Only `home` may import other modules. `shared/` never imports `modules/` or `app/`.
- Only `src/shared/api/**` imports `axios`. Each module calls the backend from `api/*.service.ts`.
- Server Components are the default. Add `"use client"` only for interactivity.

## Data and caching

- Catalog data comes from the backend API. Response types are hand-written mirrors of `docs/api/api-contracts.md`: the envelope in `src/shared/types/api.ts`, resources in each module's `types.ts`. Update them whenever the contract changes. Don't add Zod.
- Prices are integer minor units (`{ amount, currency }`). Format them with `formatPrice` from `@/shared/lib/format-price`.
- `stockStatus` comes from the API. Don't recompute it.
- Server reads go through `serverApi` inside `'use cache'` service functions with `cacheLife` and `cacheTag("catalog")`. Axios isn't instrumented by Next, so an uncached call outside `<Suspense>` breaks prerendering. Return plain JSON (`response.data.data`).
- Request-specific data (the session, via `@/modules/auth/server`) reads `await headers()`. Never call it inside `'use cache'`, and render it inside `<Suspense>`.
- Client Components use `browserApi` (`/api/v1`, same origin). `next.config.ts` rewrites `/api/v1/*` and `/api/auth/*` to `BACKEND_URL`.
- Editorial content (hero, stories, curated slug lists, featured collections, navigation) is static in each module's `content.ts`.
- When adding sample images, use only unbranded photos (no visible logos or labels, including at PDP size).

## Next.js 16 notes

- This is Next 16, which has breaking changes from older versions (e.g. `middleware.ts` is now `proxy.ts`, route `params` are Promises). Check `node_modules/next/dist/docs/` before writing Next-specific code.
- Await `params` only inside the `<Suspense>`-wrapped component, never in the page itself. Awaiting it at the top level triggers the dev warning "URL data outside of Suspense". Apply the same pattern to future dynamic routes (e.g. `/collections/[slug]`).
- `generateStaticParams` must return at least one param (Cache Components; `dynamicParams` is unavailable).
- Unknown slugs call `notFound()`, which renders `src/app/not-found.tsx` with HTTP **200** + `noindex`, because the shell has already streamed. A true 404 status would need a slug check in `proxy.ts`.
- `src/app/error.tsx` handles render failures, such as the API being down.
- The "Add to bag" button is a placeholder until the cart exists.

## Design system

All tokens and primitives live in `src/app/globals.css` (Tailwind v4, CSS-first, no `tailwind.config`). Fonts are loaded in `src/app/layout.tsx` via `next/font` (Inter → `font-sans`, Bodoni Moda → `font-display`).

- **Colors and corners:**
  - The default Tailwind color palette and radius scale are removed (`--color-*: initial`, `--radius-*: initial`). Classes like `bg-zinc-100` or `rounded-md` generate nothing.
  - Use the tokens: `canvas`, `surface`, `surface-strong`, `ink`, `ink-soft`, `ink-muted`, `ink-subtle`, `line`, `line-strong`, `sale`, `success`, `overlay`.
  - Corners are square; only `rounded-full` exists.
  - A bare `border`/`border-b` is a hairline in `line` color (set in the base layer).
- **Text:**
  - Use the `type-*` utilities (`type-display-xl`, `type-display`, `type-heading`, `type-title`, `type-body-lg`, `type-body`, `type-caption`, `type-label`, `type-micro`). They set family, size, leading, tracking and case, but never color.
  - Serif display is for large headings only. All UI text is sans, and labels, buttons and nav are uppercase `type-label`.
- **Layout:**
  - Width: `container-page|content|prose|form`.
  - Responsive spacing tokens: `gutter`, `section`, `section-sm`, `header`, `announcement` (e.g. `px-gutter`, `py-section`, `top-header`). Change their values per breakpoint in the base-layer `:root` block, not in components.
  - `h-hero` fills the first screen below the announcement bar and header.
  - Grids: `grid-page` (4/8/12 cols), `grid-products` (2/3/4 cols, for full listing pages), `rail` (snap carousel).
  - The `ProductGrid` component is the single 4-product row (2×2 → 1×4) used for curated and related sets; `ProductListing` wraps `grid-products` for full listing pages.
  - Images: `media-frame` + `aspect-product|portrait|landscape`.
- **Buttons:** `btn` + `btn-primary|secondary|inverse|ghost` (+ `btn-sm|lg|icon`). Variants and sizes only set `--btn-*` custom properties; keep it that way when adding new ones.
- **Links:** `link` (inline underlined), `link-quiet` (nav/footer), `link-muted`.
- **Inputs:** `input-base`.
- **Theme:** light only (`color-scheme: light`); there is no dark mode.
