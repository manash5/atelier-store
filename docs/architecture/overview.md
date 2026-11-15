# System overview

Atelier is a premium fashion storefront. The repository holds two standalone, independently deployable npm apps that share no code. Each has its own `package.json`, lockfile and `node_modules`, and declares only the dependencies it uses.

```
Browser ──► frontend (Next.js 16, storefront domain)
              │  Server Components ──server Axios──► BACKEND_URL (private)
              │  Browser: /api/v1/*, /api/auth/*  ──Next rewrites──┐
              ▼                                                    ▼
                               backend (Express 5)
                               routes → controllers → services → repositories → database
                               Better Auth at /api/auth/*
                                          │ Drizzle ORM (node-postgres)
                                          ▼
                                    Neon PostgreSQL
```

| Workspace | Package | Owns |
|---|---|---|
| `frontend/` | `@atelier/frontend` | Rendering, routing, SEO, caching, the design system, editorial content (hero, collections, navigation) |
| `backend/` | `@atelier/backend` | All data access, business rules (stock status, related products), Better Auth and sessions, schema, migrations and seeds |

## Key flows

**Prerendering a product page.**
1. `next build` calls `generateStaticParams`, which pages through `GET /api/v1/products` to collect every slug.
2. Each page then calls `GET /api/v1/products/:slug` and `/related`.
3. The calls run inside `'use cache'` functions, so the HTML is prerendered and revalidated hourly.

The backend must be running, migrated and seeded during a frontend build.

**A browser API call** (future cart/account features):
1. A Client Component calls `browserApi` with `/api/v1/...` on the storefront origin.
2. The `next.config.ts` rewrites forward the request to the backend.
3. Cookies stay first-party and the backend URL is never exposed.

**Authentication:**
- Better Auth runs in Express. The browser reaches `/api/auth/*` through the same rewrites, so session cookies belong to the storefront domain.
- Server Components read the session by forwarding the visitor's cookies to `/api/auth/get-session` (`@/modules/auth/server`).
- No sign-in methods are enabled yet.

## Environment

Each app reads its own `.env.local`. `.env.example` templates live next to each app's `package.json`. Real env files are never committed.

| App | Variable | Exposure | Notes |
|---|---|---|---|
| backend | `DATABASE_URL` | private | Neon **pooled** connection string |
| backend | `DATABASE_POOL_MAX` | private | default 10 |
| backend | `PORT` | private | default 4000 |
| backend | `NODE_ENV`, `LOG_LEVEL` | private | |
| backend | `CORS_ORIGINS` | private | comma-separated; default `http://localhost:3000` |
| backend | `TRUST_PROXY` | private | proxy hops in front of the API; default 1 |
| backend | `BETTER_AUTH_SECRET` | private | ≥ 32 chars (`openssl rand -base64 32`) |
| backend | `BETTER_AUTH_URL` | private | public **storefront** origin |
| frontend | `BACKEND_URL` | server-only | e.g. `http://localhost:4000`. Used by server Axios and rewrites; never prefix with `NEXT_PUBLIC_` |
| frontend | `NEXT_PUBLIC_APP_URL` | public | storefront origin |

Rules:
- `backend/src/config/env.ts` validates the backend environment at startup and fails fast.
- The frontend has no database credentials.

## Deployment

1. **Database:** run `npm run db:migrate` in `backend/` against the target Neon branch (production, or a preview branch per PR).
2. **Backend:**
   - In `backend/`: `npm ci && npm run build`, then run `node dist/server.js` on any Node 24 host.
   - Health check: `GET /health`.
   - It only needs to be reachable by the frontend's servers.
3. **Frontend:** deploy after the backend is live, because `next build` prerenders product pages from the API. Set `BACKEND_URL` to the backend's URL.

Preview frontends need a preview (or staging) backend.

## Further reading

- [Frontend architecture](frontend-architecture.md)
- [Backend architecture](backend-architecture.md)
- [Architecture decisions](decisions.md)
- [Database design](../database/database-design.md)
- [API contracts](../api/api-contracts.md)
