import { Router } from "express";

import { cartController } from "../controllers/cart.controller";
import { AddCartItemBody, CartItemParams, UpdateCartItemBody } from "../dtos/cart.dto";
import { authorize } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate";

/** The signed-in user's bag. */
export const cartRouter = Router();

cartRouter.use(authorize);

cartRouter.get("/", cartController.get);
cartRouter.get("/count", cartController.count);
cartRouter.post("/items", validate({ body: AddCartItemBody }), cartController.addItem);
cartRouter.patch(
  "/items/:slug",
  validate({ params: CartItemParams, body: UpdateCartItemBody }),
  cartController.updateItem,
);
cartRouter.delete("/items/:slug", validate({ params: CartItemParams }), cartController.removeItem);
