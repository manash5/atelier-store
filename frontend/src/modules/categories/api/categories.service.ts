import "server-only";

import { cacheLife, cacheTag } from "next/cache";

import { serverApi } from "@/shared/api/server-client";

import type { Category, CategoryListResponse } from "../types";

/** All categories in display order. */
export async function getCategories(): Promise<Category[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("catalog");

  const { data } = await serverApi.get<CategoryListResponse>("/categories");
  return data.data;
}
