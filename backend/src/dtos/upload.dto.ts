import { z } from "zod";

/** A stored upload, returned by POST /api/v1/admin/uploads. */
export const UploadDto = z.object({
  /** Path to fetch the file from, e.g. `/uploads/<uuid>.jpg`. */
  url: z.string(),
  filename: z.string(),
  size: z.number().int().nonnegative(),
  mimeType: z.string(),
});
export type UploadDto = z.infer<typeof UploadDto>;
