import { z } from "zod";

import type { Category } from "../models/category";
import { type ApiSuccess, ImageDto, Slug } from "./common.dto";

/** Category as embedded in a product. */
export const CategorySummaryDto = z.object({
  slug: Slug,
  title: z.string(),
});
export type CategorySummaryDto = z.infer<typeof CategorySummaryDto>;

export const CategoryDto = CategorySummaryDto.extend({
  image: ImageDto.nullable(),
});
export type CategoryDto = z.infer<typeof CategoryDto>;

export type CategoryListResponse = ApiSuccess<CategoryDto[]>;

export function toCategoryDto(category: Category): CategoryDto {
  return {
    slug: category.slug,
    title: category.title,
    image: category.image ?? null,
  };
}
