import { UPLOADS_URL_PREFIX } from "../config/uploads";
import type { UploadDto } from "../dtos/upload.dto";
import { AppError } from "../exceptions";

interface StoredFile {
  filename: string;
  size: number;
  mimetype: string;
}

export const uploadService = {
  /** Describes a file already written to disk by the upload middleware. */
  describe(file: StoredFile | undefined): UploadDto {
    if (!file) {
      throw new AppError(400, "VALIDATION_ERROR", "No image was uploaded", [
        { path: "image", message: 'Attach an image in the "image" field' },
      ]);
    }
    return {
      url: `${UPLOADS_URL_PREFIX}/${file.filename}`,
      filename: file.filename,
      size: file.size,
      mimeType: file.mimetype,
    };
  },
};
