import { Router } from "express";

import { categoryRouter } from "./category.routes";
import { productRouter } from "./product.routes";

/** Versioned REST API, mounted at /api/v1. */
export const apiRouter = Router();

apiRouter.use("/products", productRouter);
apiRouter.use("/categories", categoryRouter);

export { healthRouter } from "./health.routes";
