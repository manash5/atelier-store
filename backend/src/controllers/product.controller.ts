import type { Request, Response } from "express";

import {
  ListProductsQuery,
  ProductSlugParams,
  RelatedProductsQuery,
  toProductDto,
} from "../dtos/product.dto";
import { validated } from "../middleware/validate";
import { productService } from "../services/product.service";
import { sendOk } from "../utils/http-response";

export const productController = {
  async list(req: Request, res: Response) {
    const { slugs, page, limit, sort, category } = validated(
      req,
      "query",
      ListProductsQuery,
    );
    const result = slugs
      ? await productService.listBySlugs(slugs)
      : await productService.list({ page, limit, sort, category });
    sendOk(res, result.items.map(toProductDto), result.meta);
  },

  async getBySlug(req: Request, res: Response) {
    const { slug } = validated(req, "params", ProductSlugParams);
    const product = await productService.getBySlug(slug);
    sendOk(res, toProductDto(product));
  },

  async listRelated(req: Request, res: Response) {
    const { slug } = validated(req, "params", ProductSlugParams);
    const { limit } = validated(req, "query", RelatedProductsQuery);
    const related = await productService.getRelated(slug, limit);
    sendOk(res, related.map(toProductDto));
  },
};
