import type { Request, Response } from "express";

import { toCategoryDto } from "../dtos/category.dto";
import { categoryService } from "../services/category.service";
import { sendOk } from "../utils/http-response";

export const categoryController = {
  async list(_req: Request, res: Response) {
    const categories = await categoryService.list();
    sendOk(res, categories.map(toCategoryDto));
  },
};
