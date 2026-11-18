import type { Request, Response } from "express";

import {
  AddCartItemBody,
  CartItemParams,
  toCartDto,
  UpdateCartItemBody,
} from "../dtos/cart.dto";
import { validated } from "../middleware/validate";
import { cartService } from "../services/cart.service";
import { sendOk } from "../utils/http-response";

// Every route requires `authorize`, which sets `req.user`.
export const cartController = {
  async get(req: Request, res: Response) {
    sendOk(res, toCartDto(await cartService.get(req.user!.sub)));
  },

  async count(req: Request, res: Response) {
    sendOk(res, { count: await cartService.count(req.user!.sub) });
  },

  async addItem(req: Request, res: Response) {
    const { productSlug, quantity } = validated(req, "body", AddCartItemBody);
    sendOk(res, toCartDto(await cartService.add(req.user!.sub, productSlug, quantity)));
  },

  async updateItem(req: Request, res: Response) {
    const { slug } = validated(req, "params", CartItemParams);
    const { quantity } = validated(req, "body", UpdateCartItemBody);
    sendOk(res, toCartDto(await cartService.setQuantity(req.user!.sub, slug, quantity)));
  },

  async removeItem(req: Request, res: Response) {
    const { slug } = validated(req, "params", CartItemParams);
    sendOk(res, toCartDto(await cartService.remove(req.user!.sub, slug)));
  },
};
