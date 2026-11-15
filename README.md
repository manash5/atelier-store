# Atelier Store

Premium fashion storefront. It is two standalone apps in one repository: a Next.js 16 frontend and an Express 5 API with Drizzle ORM on Neon PostgreSQL. Each app has its own `package.json`, lockfile and `node_modules`.

```
frontend/            Next.js storefront (modular: src/app, src/modules, src/shared)
backend/             Express REST API (layered: routes → controllers → services → repositories)
docs/                Architecture, database and API documentation
```

## Setup

Requires Node 24 (npm is included).

```bash
# Backend (terminal 1)
cd backend
npm install

# Create backend/.env.local and frontend/.env.local from their .env.example files.
# See docs/architecture/overview.md#environment.

npm run db:migrate   # apply migrations to DATABASE_URL
npm run db:seed      # load the sample catalog
npm run dev          # API on :4000

# Frontend (terminal 2)
cd frontend
npm install
npm run dev          # storefront on :3000
```

See `docs/architecture/overview.md` for how the pieces fit together.
