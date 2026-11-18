"use server";

import { refresh, updateTag } from "next/cache";
import { redirect } from "next/navigation";

import { isApiError } from "@/shared/api/errors";
import { getAccessToken } from "@/shared/lib/auth-cookies";

import {
  addCartItem,
  placeOrder,
  removeCartItem,
  updateCartItem,
} from "./api/cart.service";
import { validateCheckout } from "./lib/checkout-validation";
import type { AddToBagState, CartLineState, CheckoutState } from "./types";

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const UNREACHABLE = "We can't reach the store right now. Please try again.";

function slugFrom(formData: FormData): string | null {
  const slug = formData.get("slug");
  return typeof slug === "string" && SLUG.test(slug) ? slug : null;
}

/**
 * Server Functions can be called from any page, so each one checks for a
 * signed-in visitor itself (proxy.ts keeps the access token fresh).
 */
async function requireSignIn(returnTo: string) {
  if (!(await getAccessToken())) redirect(`/sign-in?next=${encodeURIComponent(returnTo)}`);
}

function messageFor(error: unknown): string {
  if (isApiError(error, 0)) return UNREACHABLE;
  if (isApiError(error)) return error.message;
  throw error;
}

export async function addToBagAction(
  _previous: AddToBagState,
  formData: FormData,
): Promise<AddToBagState> {
  const slug = slugFrom(formData);
  if (!slug) return { status: "error", message: "This product can't be added." };
  await requireSignIn(`/products/${slug}`);

  try {
    await addCartItem(slug, 1);
  } catch (error) {
    if (isApiError(error, 401)) redirect(`/sign-in?next=/products/${slug}`);
    return { status: "error", message: messageFor(error) };
  }
  refresh(); // updates the header bag count
  return { status: "added", message: "Added to your bag." };
}

export async function updateQuantityAction(
  _previous: CartLineState,
  formData: FormData,
): Promise<CartLineState> {
  const slug = slugFrom(formData);
  const quantity = Number(formData.get("quantity"));
  if (!slug || !Number.isInteger(quantity) || quantity < 1) return { error: "Choose a quantity." };
  await requireSignIn("/bag");

  try {
    await updateCartItem(slug, quantity);
  } catch (error) {
    return { error: messageFor(error) };
  }
  refresh();
  return {};
}

export async function removeItemAction(
  _previous: CartLineState,
  formData: FormData,
): Promise<CartLineState> {
  const slug = slugFrom(formData);
  if (!slug) return { error: "This item can't be removed." };
  await requireSignIn("/bag");

  try {
    await removeCartItem(slug);
  } catch (error) {
    // Already gone (e.g. removed in another tab): the refresh shows the truth.
    if (!isApiError(error, 404)) return { error: messageFor(error) };
  }
  refresh();
  return {};
}

export async function placeOrderAction(
  _previous: CheckoutState,
  formData: FormData,
): Promise<CheckoutState> {
  await requireSignIn("/checkout");

  const result = validateCheckout(formData);
  if (!result.ok) return { fieldErrors: result.fieldErrors, values: result.values };

  let number: string;
  try {
    const order = await placeOrder({
      shippingAddress: result.shippingAddress,
      cardLast4: result.cardLast4,
    });
    number = order.number;
  } catch (error) {
    if (isApiError(error, 409)) {
      refresh();
      return {
        error: `${error.message}. Review your bag to update it before paying.`,
        values: result.values,
      };
    }
    return { error: messageFor(error), values: result.values };
  }

  // Stock changed: product pages and listings must show it right away.
  updateTag("catalog");
  redirect(`/orders/${number}`);
}
