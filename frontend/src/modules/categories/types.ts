import type { ApiSuccess } from "@/shared/types/api";
import type { Image } from "@/shared/types/image";

// Mirrors CategoryDto in docs/api/api-contracts.md.
export type Category = {
  slug: string;
  title: string;
  /** Categories without an image are hidden from the homepage grid. */
  image: Image | null;
};

export type CategoryResponse = ApiSuccess<Category>;
export type CategoryListResponse = ApiSuccess<Category[]>;
