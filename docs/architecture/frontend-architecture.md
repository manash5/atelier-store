# Frontend architecture

The frontend is Next.js 16 (App Router, Turbopack, Cache Components) and is organised by feature modules.

## Directory structure

```
frontend/src/
├── app/                          # routing only
│   ├── layout.tsx  globals.css  not-found.tsx  error.tsx
│   ├── page.tsx                  # → @/modules/home
│   ├── collections/new-in/page.tsx  # metadata → @/modules/products (NewArrivalsPage)
│   ├── collections/[slug]/page.tsx  # category pages: params, metadata, Suspense → categories + products
│   └── products/[slug]/page.tsx  # params, metadata, Suspense → @/modules/products
├── modules/
│   ├── home/        components/, content.ts (editorial copy, curated slug lists), index.ts
│   ├── products/    components/, api/products.service.ts, types.ts, index.ts, server.ts
│   ├── categories/  components/, api/categories.service.ts, types.ts, index.ts, server.ts
│   ├── collections/ components/, content.ts, types.ts, index.ts
│   └── auth/        api/session.service.ts, server.ts   (React auth client added with the sign-in UI)
└── shared/
    ├── api/         server-client.ts, browser-client.ts, errors.ts   (the only Axios users)
    ├── layout/      site-header, site-footer, menu-drawer, navigation.ts
    ├── ui/          section-heading, icons, disclosure
    ├── lib/         format-price.ts, unsplash.ts
    └── types/       api.ts (response envelope, Money), image.ts
```

Each module adds `hooks/` or `utils/` folders only when it needs them. Cart and checkout will be added as new modules.

## Module rules

ESLint `no-restricted-imports` in `eslint.config.mjs` enforces these rules:

1. **Routes are thin.** `app/**` handles params, `generateMetadata`, `generateStaticParams`, Suspense boundaries and `notFound()`. Everything else comes from modules.
2. **Public entry points only.**
   - Code outside a module imports `@/modules/<name>` (UI and types, safe for Client Components) or `@/modules/<name>/server` (server-only data access).
   - Deep imports such as `@/modules/products/components/...` are errors.
   - Inside a module, use relative imports.
3. **Dependency direction** is `app → modules → shared`.
   - Only `home` may import other modules: it composes the homepage.
   - Feature modules (`products`, `categories`, `collections`, `auth`) never import each other.
   - `shared/` never imports `modules/` or `app/`.
   - Together these rules rule out circular dependencies.
4. **API calls live in `modules/*/api/*.service.ts`.**
   - Only `shared/api/**` may import `axios`.
   - Components call services and never call Axios directly.

## Server and client components

- Server Components are the default.
- `"use client"` is used only where interactivity needs it: `menu-drawer`, `product-gallery` and `error.tsx`.
- Data-fetching components are `async` Server Components that call module services.

## Talking to the backend

| Client | Where | Base URL | Use |
|---|---|---|---|
| `serverApi` | `shared/api/server-client.ts` (`server-only`) | `BACKEND_URL/api/v1` | Server Components, metadata, static params |
| `authApi` | same file | `BACKEND_URL/api/auth` | Server-side session lookup |
| `browserApi` | `shared/api/browser-client.ts` | `/api/v1` (same origin, rewritten) | Client Components (cart, account) |

Error handling:
- An interceptor turns every failure into `ApiError { status, code, message }`. A network failure gets `code: "NETWORK_ERROR"` and `status: 0`.
- Services map expected errors to values. For example, `getProduct` returns `null` on 404 or 400, and the route calls `notFound()`.
- Unexpected errors propagate to `app/error.tsx`.

Loading states:
- The PDP uses the existing Suspense skeleton.
- Client-side requests will use local pending state.

## Caching and static generation

- Every catalog read is a `'use cache'` function with `cacheLife("hours")` and `cacheTag("catalog")`. Per-product reads also add `product:<slug>`. Axios bypasses Next's fetch instrumentation, so caching must always be explicit; never call `serverApi` outside a cached function or a Suspense boundary.
- Return values must be plain JSON, so services return `response.data.data`.
- `generateStaticParams` returns every slug from the API, so all product pages are prerendered with full HTML, metadata and JSON-LD.
- Unknown slugs render on request and call `notFound()`. That responds with **HTTP 200** and `noindex`, because the shell has already streamed.
- **Stock freshness:** prerendered stock can lag the database by up to the cache lifetime. Once something writes stock (orders, admin), it should call a protected route handler that runs `revalidateTag("catalog", "max")`. Checkout must always read stock uncached.
- Request-specific reads (sessions) read `await headers()` outside any cache scope and render inside `<Suspense>`.

## Design system

The design system is unchanged and centralised:
- Tokens, primitives and utilities live in `src/app/globals.css` (Tailwind v4, CSS-first).
- Fonts are loaded in `src/app/layout.tsx`.

`frontend/CLAUDE.md` lists the rules.

## Contract types

- The frontend shares no code with the backend. Response types are hand-written mirrors of `docs/api/api-contracts.md`.
- The envelope types are in `shared/types/api.ts`, and the resource types are in each module's `types.ts` (`Product`, `Category`).
- Prices arrive as integer minor units (`{ amount, currency }`), and `formatPrice` divides by 100.
