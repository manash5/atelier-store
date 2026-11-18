import "server-only";

import { cacheLife, cacheTag } from "next/cache";

import { isApiError } from "@/shared/api/errors";
import { serverApi } from "@/shared/api/server-client";

import type {
  Product,
  ProductListResponse,
  ProductResponse,
  ShopGender,
} from "../types";

// Catalog reads are cached and tagged so they prerender into the static shell.
// Invalidate with revalidateTag("catalog", "max") once something writes stock.

/** `null` when the product doesn't exist (or the slug is malformed). */
export async function getProduct(slug: string): Promise<Product | null> {
  "use cache";
  cacheLife("hours");
  cacheTag("catalog", `product:${slug}`);

  try {
    const { data } = await serverApi.get<ProductResponse>(
      `/products/${encodeURIComponent(slug)}`,
    );
    return data.data;
  } catch (error) {
    if (isApiError(error, 404) || isApiError(error, 400)) return null;
    throw error;
  }
}

/** Curated selections: exactly these products, in this order. */
export async function getProductsBySlugs(slugs: string[]): Promise<Product[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("catalog");

  const { data } = await serverApi.get<ProductListResponse>("/products", {
    params: { slugs: slugs.join(",") },
  });
  return data.data;
}

/** The most recently added products, newest first ("New In"). */
export async function getNewArrivals(limit = 24): Promise<Product[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("catalog");

  const { data } = await serverApi.get<ProductListResponse>("/products", {
    params: { sort: "newest", limit },
  });
  return data.data;
}

/** One category's products, in catalog order ("/collections/<category>"). */
export async function getProductsByCategory(
  categorySlug: string,
  limit = 24,
): Promise<Product[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("catalog", `category:${categorySlug}`);

  const { data } = await serverApi.get<ProductListResponse>("/products", {
    params: { category: categorySlug, limit },
  });
  return data.data;
}

/** The Women or Men edit: that gender plus unisex, in catalog order. */
export async function getProductsByGender(
  gender: ShopGender,
  limit = 24,
): Promise<Product[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("catalog");

  const { data } = await serverApi.get<ProductListResponse>("/products", {
    params: { gender, limit },
  });
  return data.data;
}

/** Same-category products first, then the rest of the catalog. */
export async function getRelatedProducts(slug: string, limit = 4): Promise<Product[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("catalog", `product:${slug}`);

  const { data } = await serverApi.get<ProductListResponse>(
    `/products/${encodeURIComponent(slug)}/related`,
    { params: { limit } },
  );
  return data.data;
}

/** Every product slug, for generateStaticParams. Pages through the catalog. */
export async function getAllProductSlugs(): Promise<string[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("catalog");

  const limit = 100;
  const slugs: string[] = [];
  for (let page = 1; ; page++) {
    const { data } = await serverApi.get<ProductListResponse>("/products", {
      params: { page, limit },
    });
    slugs.push(...data.data.map((product) => product.slug));
    if (data.data.length < limit || slugs.length >= data.meta.total) break;
  }
  return slugs;
}
