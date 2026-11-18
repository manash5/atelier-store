// Every table drizzle-kit migrates and the relational query API (db.query.*)
// can see. Keep app tables in their own files: the Better Auth CLI
// (`pnpm auth:generate`) overwrites ./auth.ts only.
export * from "./auth";
export * from "./catalog";
export * from "./commerce";
