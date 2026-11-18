import "server-only";

import { isApiError } from "@/shared/api/errors";
import { authedServerApi } from "@/shared/api/server-client";
import { getAccessToken } from "@/shared/lib/auth-cookies";
import type { ApiSuccess } from "@/shared/types/api";

import type { Cart, Order, ShippingAddress } from "../types";

// Request-specific (the visitor's access token): never call inside
// 'use cache', and render callers inside <Suspense>.

/** The visitor's bag, or null when they aren't signed in. */
export async function getCart(): Promise<Cart | null> {
  const api = await authedServerApi();
  try {
    const { data } = await api.get<ApiSuccess<Cart>>("/cart");
    return data.data;
  } catch (error) {
    if (isApiError(error, 401)) return null;
    throw error;
  }
}

/** Units in the bag; 0 for guests or if the API is unreachable (header badge). */
export async function getCartCount(): Promise<number> {
  if (!(await getAccessToken())) return 0;
  const api = await authedServerApi();
  try {
    const { data } = await api.get<ApiSuccess<{ count: number }>>("/cart/count");
    return data.data.count;
  } catch (error) {
    if (isApiError(error)) return 0;
    throw error;
  }
}

export async function addCartItem(productSlug: string, quantity = 1): Promise<Cart> {
  const api = await authedServerApi();
  const { data } = await api.post<ApiSuccess<Cart>>("/cart/items", { productSlug, quantity });
  return data.data;
}

export async function updateCartItem(slug: string, quantity: number): Promise<Cart> {
  const api = await authedServerApi();
  const { data } = await api.patch<ApiSuccess<Cart>>(`/cart/items/${encodeURIComponent(slug)}`, {
    quantity,
  });
  return data.data;
}

export async function removeCartItem(slug: string): Promise<Cart> {
  const api = await authedServerApi();
  const { data } = await api.delete<ApiSuccess<Cart>>(`/cart/items/${encodeURIComponent(slug)}`);
  return data.data;
}

export async function placeOrder(input: {
  shippingAddress: ShippingAddress;
  cardLast4: string;
}): Promise<Order> {
  const api = await authedServerApi();
  const { data } = await api.post<ApiSuccess<Order>>("/orders", {
    shippingAddress: input.shippingAddress,
    payment: { cardLast4: input.cardLast4 },
  });
  return data.data;
}

/** One of the visitor's orders, or null if it doesn't exist or isn't theirs. */
export async function getOrder(number: string): Promise<Order | null> {
  const api = await authedServerApi();
  try {
    const { data } = await api.get<ApiSuccess<Order>>(`/orders/${encodeURIComponent(number)}`);
    return data.data;
  } catch (error) {
    if (isApiError(error, 404) || isApiError(error, 400) || isApiError(error, 401)) return null;
    throw error;
  }
}

/** The visitor's most recent orders (newest first); empty for guests. */
export async function getRecentOrders(): Promise<Order[]> {
  const api = await authedServerApi();
  try {
    const { data } = await api.get<ApiSuccess<Order[]>>("/orders");
    return data.data;
  } catch (error) {
    if (isApiError(error, 401)) return [];
    throw error;
  }
}
