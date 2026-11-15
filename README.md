# Atelier Store

Next.js (App Router) · TypeScript · Tailwind CSS v4 · Better Auth · Drizzle ORM · Neon Postgres

## Setup

```bash
npm install
cp .env.example .env.local   # fill in DATABASE_URL and BETTER_AUTH_SECRET
npm run auth:generate        # writes Better Auth tables to src/db/schema.ts
npm run db:push              # or db:generate + db:migrate
npm run dev
```

## Structure

```
src/
  app/api/auth/[...all]/route.ts  Better Auth route handler
  db/index.ts                     Drizzle client (Neon HTTP driver)
  db/schema.ts                    Drizzle schema
  lib/auth.ts                     Better Auth server instance
  lib/auth-client.ts              Better Auth React client
drizzle.config.ts                 drizzle-kit config (migrations in ./drizzle)
```

## Scripts

| Script | Purpose |
| --- | --- |
| `dev` / `build` / `start` | Next.js |
| `lint` / `typecheck` | ESLint / `tsc --noEmit` |
| `auth:generate` | Generate Better Auth Drizzle schema |
| `db:generate` / `db:migrate` / `db:push` / `db:studio` | drizzle-kit |
