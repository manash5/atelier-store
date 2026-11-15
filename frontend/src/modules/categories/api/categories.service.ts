import "server-only";

import { cacheLife, cacheTag } from "next/cache";

import { isApiError } from "@/shared/api/errors";
import { serverApi } from "@/shared/api/server-client";

import type { Category, CategoryListResponse, CategoryResponse } from "../types";

/** One category, or `null` when it doesn't exist (or the slug is malformed). */
export async function getCategory(slug: string): Promise<Category | null> {
  "use cache";
  cacheLife("hours");
  cacheTag("catalog", `category:${slug}`);

  try {
    const { data } = await serverApi.get<CategoryResponse>(
      `/categories/${encodeURIComponent(slug)}`,
    );
    return data.data;
  } catch (error) {
    if (isApiError(error, 404) || isApiError(error, 400)) return null;
    throw error;
  }
}

/** All categories in display order. */
export async function getCategories(): Promise<Category[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("catalog");

  const { data } = await serverApi.get<CategoryListResponse>("/categories");
  return data.data;
}
