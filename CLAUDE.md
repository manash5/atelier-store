# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Atelier is a premium fashion storefront. The repository holds two **standalone** npm apps:
- `frontend/`: Next.js 16 storefront
- `backend/`: Express 5 REST API that owns the database and auth

Each app has its own `package.json`, `package-lock.json`, `node_modules` and `CLAUDE.md` with its commands. The repo root has no package files. Architecture docs live in `docs/`; start with `docs/architecture/overview.md`.

## Commands

Run every command inside `backend/` or `frontend/`, never at the root:
- `npm install`, `npm run dev`, `npm run build`, `npm run typecheck`, `npm run lint` in either app
- `npm test` and `npm run db:*` in `backend/`

Local development needs both dev servers: backend on :4000, frontend on :3000. The frontend build needs the backend running, migrated and seeded.

## Rules

- Use **npm**. Don't use pnpm or yarn, and commit each app's `package-lock.json`.
- npm blocks dependency install scripts unless they are approved. Approve one with `npm install-scripts approve <pkg>`, which records it under `allowScripts` in that app's `package.json`. The backend allows only `esbuild`.
- **Don't add package files at the root** or a shared `packages/` folder. Each dependency goes in the app that uses it (`npm install <package>` inside that folder).
- The **frontend never touches the database** or imports from `backend/`, and the backend never imports from `frontend/`. They talk over REST only.
- **API contract changes** follow `docs/api/api-contracts.md`: backend Zod DTOs first, then the mirrored frontend types. Afterwards `npm run typecheck` must pass in both apps and `npm test` in `backend/`.
- **Never read, print or edit real `.env*` files.** Use each app's `.env.example`; the variables are listed in `docs/architecture/overview.md`. Secrets and DB credentials stay in the backend.
- **Database changes** go through versioned migrations: `db:generate`, review the SQL, `db:migrate`. Never run `drizzle-kit push` against shared databases.
- When an architectural decision changes, record it in `docs/architecture/decisions.md`. Update the relevant `docs/` page when its structure or behaviour changes.
