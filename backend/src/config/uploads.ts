import { mkdirSync } from "node:fs";
import path from "node:path";

import { env } from "./env";

/** Absolute directory where uploaded files are written and served from. */
export const uploadDir = path.resolve(env.UPLOAD_DIR);

/** Public URL prefix for uploaded files (served by express.static in app.ts). */
export const UPLOADS_URL_PREFIX = "/uploads";

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

export const IMAGE_MIME_TYPES: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/avif": ".avif",
};

export function ensureUploadDir() {
  mkdirSync(uploadDir, { recursive: true });
}
