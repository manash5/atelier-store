import type { Category } from "../models/category";
import { categoryRepository } from "../repositories/category.repository";

export const categoryService = {
  /** All categories in display order. */
  async list(): Promise<Category[]> {
    return categoryRepository.findAll();
  },
};
