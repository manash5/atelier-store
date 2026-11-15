import { NotFoundError } from "../exceptions";
import type { Category } from "../models/category";
import { categoryRepository } from "../repositories/category.repository";

export const categoryService = {
  async getBySlug(slug: string): Promise<Category> {
    const category = await categoryRepository.findBySlug(slug);
    if (!category) throw new NotFoundError(`Category "${slug}" not found`);
    return category;
  },

  /** All categories in display order. */
  async list(): Promise<Category[]> {
    return categoryRepository.findAll();
  },
};
