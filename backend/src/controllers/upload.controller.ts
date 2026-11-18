import type { Request, Response } from "express";

import { uploadService } from "../services/upload.service";
import { sendCreated } from "../utils/http-response";

export const uploadController = {
  /** Requires `uploadImage`, which writes the file and sets `req.file`. */
  create(req: Request, res: Response) {
    sendCreated(res, uploadService.describe(req.file));
  },
};
