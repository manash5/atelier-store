import { Router } from "express";

import { categoryController } from "../controllers/category.controller";
import { CategorySlugParams } from "../dtos/category.dto";
import { validate } from "../middleware/validate";

export const categoryRouter = Router();

categoryRouter.get("/", categoryController.list);

categoryRouter.get(
  "/:slug",
  validate({ params: CategorySlugParams }),
  categoryController.getBySlug,
);
