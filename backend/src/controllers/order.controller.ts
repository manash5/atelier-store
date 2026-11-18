import type { Request, Response } from "express";

import { OrderNumberParams, PlaceOrderBody, toOrderDto } from "../dtos/order.dto";
import { validated } from "../middleware/validate";
import { orderService } from "../services/order.service";
import { sendCreated, sendOk } from "../utils/http-response";

// Every route requires `authorize`, which sets `req.user`.
export const orderController = {
  async place(req: Request, res: Response) {
    const { shippingAddress, payment } = validated(req, "body", PlaceOrderBody);
    const order = await orderService.place({
      userId: req.user!.sub,
      email: req.user!.email,
      shippingAddress,
      cardLast4: payment.cardLast4,
    });
    sendCreated(res, toOrderDto(order));
  },

  async list(req: Request, res: Response) {
    const orders = await orderService.listRecent(req.user!.sub);
    sendOk(res, orders.map(toOrderDto));
  },

  async get(req: Request, res: Response) {
    const { number } = validated(req, "params", OrderNumberParams);
    sendOk(res, toOrderDto(await orderService.get(req.user!.sub, number)));
  },
};
