import { Router } from "express";

import { uploadController } from "../controllers/upload.controller";
import { authorize, authorizeAdmin } from "../middleware/auth.middleware";
import { uploadImage } from "../middleware/upload.middleware";

/** Everything here requires an admin access token. */
export const adminRouter = Router();

adminRouter.use(authorize, authorizeAdmin);

// Auth runs before multer, so anonymous or non-admin uploads are rejected
// before any bytes are written to disk.
adminRouter.post("/uploads", uploadImage, uploadController.create);
