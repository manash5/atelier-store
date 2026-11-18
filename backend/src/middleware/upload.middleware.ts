import { randomUUID } from "node:crypto";

import multer from "multer";

import {
  ensureUploadDir,
  IMAGE_MIME_TYPES,
  MAX_IMAGE_BYTES,
  uploadDir,
} from "../config/uploads";
import { AppError } from "../exceptions";

const storage = multer.diskStorage({
  destination(_req, _file, callback) {
    ensureUploadDir();
    callback(null, uploadDir);
  },
  // Never trust the client's filename: a random name plus an extension
  // derived from the (allow-listed) MIME type.
  filename(_req, file, callback) {
    callback(null, `${randomUUID()}${IMAGE_MIME_TYPES[file.mimetype] ?? ""}`);
  },
});

const imageUpload = multer({
  storage,
  limits: { fileSize: MAX_IMAGE_BYTES, files: 1, fields: 10 },
  fileFilter(_req, file, callback) {
    if (file.mimetype in IMAGE_MIME_TYPES) return callback(null, true);
    callback(
      new AppError(400, "VALIDATION_ERROR", "Only JPEG, PNG, WebP or AVIF images are allowed", [
        { path: file.fieldname, message: `Unsupported file type ${file.mimetype}` },
      ]),
    );
  },
});

/** Accepts one image in the multipart field `image` and exposes it as `req.file`. */
export const uploadImage = imageUpload.single("image");

const MULTER_MESSAGES: Partial<Record<multer.ErrorCode, string>> = {
  LIMIT_FILE_SIZE: `File is larger than ${MAX_IMAGE_BYTES / 1024 / 1024} MB`,
  LIMIT_FILE_COUNT: "Only one file can be uploaded at a time",
  LIMIT_UNEXPECTED_FILE: 'Upload the file in the "image" field',
};

/** Converts multer's errors into our 400 VALIDATION_ERROR. Used by the error handler. */
export function toUploadError(error: unknown): AppError | undefined {
  if (!(error instanceof multer.MulterError)) return undefined;
  return new AppError(400, "VALIDATION_ERROR", MULTER_MESSAGES[error.code] ?? error.message, [
    { path: error.field ?? "image", message: error.message },
  ]);
}
