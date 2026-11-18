import { Router } from "express";

import { adminRouter } from "./admin.routes";
import { cartRouter } from "./cart.routes";
import { categoryRouter } from "./category.routes";
import { meRouter } from "./me.routes";
import { orderRouter } from "./order.routes";
import { productRouter } from "./product.routes";

/** Versioned REST API, mounted at /api/v1. */
export const apiRouter = Router();

apiRouter.use("/products", productRouter);
apiRouter.use("/categories", categoryRouter);
apiRouter.use("/me", meRouter);
apiRouter.use("/cart", cartRouter);
apiRouter.use("/orders", orderRouter);
apiRouter.use("/admin", adminRouter);

export { healthRouter } from "./health.routes";
