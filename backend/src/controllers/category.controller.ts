import type { Request, Response } from "express";

import { CategorySlugParams, toCategoryDto } from "../dtos/category.dto";
import { validated } from "../middleware/validate";
import { categoryService } from "../services/category.service";
import { sendOk } from "../utils/http-response";

export const categoryController = {
  async list(_req: Request, res: Response) {
    const categories = await categoryService.list();
    sendOk(res, categories.map(toCategoryDto));
  },

  async getBySlug(req: Request, res: Response) {
    const { slug } = validated(req, "params", CategorySlugParams);
    const category = await categoryService.getBySlug(slug);
    sendOk(res, toCategoryDto(category));
  },
};
