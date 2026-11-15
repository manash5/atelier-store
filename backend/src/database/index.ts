import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import { env } from "../config/env";
import * as schema from "./schema";

// node-postgres pool: suits a long-running server and supports interactive
// transactions (db.transaction). Use Neon's pooled connection string.
export const pool = new Pool({
  connectionString: env.DATABASE_URL,
  max: env.DATABASE_POOL_MAX,
  idleTimeoutMillis: 30_000,
});

export const db = drizzle({ client: pool, schema });

export type Database = typeof db;
