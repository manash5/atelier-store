import { Router } from "express";

import { productController } from "../controllers/product.controller";
import {
  ListProductsQuery,
  ProductSlugParams,
  RelatedProductsQuery,
} from "../dtos/product.dto";
import { validate } from "../middleware/validate";

export const productRouter = Router();

productRouter.get("/", validate({ query: ListProductsQuery }), productController.list);

productRouter.get(
  "/:slug",
  validate({ params: ProductSlugParams }),
  productController.getBySlug,
);

productRouter.get(
  "/:slug/related",
  validate({ params: ProductSlugParams, query: RelatedProductsQuery }),
  productController.listRelated,
);
