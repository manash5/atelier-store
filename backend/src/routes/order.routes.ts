import { Router } from "express";

import { orderController } from "../controllers/order.controller";
import { OrderNumberParams, PlaceOrderBody } from "../dtos/order.dto";
import { authorize } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate";

/** The signed-in user's orders. */
export const orderRouter = Router();

orderRouter.use(authorize);

orderRouter.post("/", validate({ body: PlaceOrderBody }), orderController.place);
orderRouter.get("/", orderController.list);
orderRouter.get("/:number", validate({ params: OrderNumberParams }), orderController.get);
