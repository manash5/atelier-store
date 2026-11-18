import { tmpdir } from "node:os";
import { join } from "node:path";

// Runs before every test file, before any app module reads the environment.
// API tests that need data run only when TEST_DATABASE_URL points at a
// migrated and seeded database (never production).
process.env.NODE_ENV = "test";
process.env.DATABASE_URL =
  process.env.TEST_DATABASE_URL ?? "postgresql://test:test@127.0.0.1:5432/test";
process.env.BETTER_AUTH_SECRET ??= "test-secret-test-secret-test-secret-123";
process.env.BETTER_AUTH_URL = "http://localhost:3000";
// Uploads from tests go to a throwaway directory, never backend/uploads.
process.env.UPLOAD_DIR = join(tmpdir(), "atelier-test-uploads");
