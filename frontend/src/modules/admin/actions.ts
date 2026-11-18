"use server";

import { decodeJwt } from "jose";
import { refresh, updateTag } from "next/cache";
import { redirect } from "next/navigation";

import { isApiError } from "@/shared/api/errors";
import { getAccessToken } from "@/shared/lib/auth-cookies";

import {
  createCategory,
  createProduct,
  setAppointmentStatus,
  setProductStock,
  setUserRole,
  updateCategory,
  updateOrderStatus,
  updateProduct,
  uploadImage,
} from "./api/admin.service";
import { parseCategoryForm, parseProductForm } from "./lib/form-parsing";
import type { FormState, OrderStatus } from "./types";

const ORDER_STATUSES: OrderStatus[] = ["paid", "processing", "shipped", "delivered", "cancelled"];
const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

/**
 * Server Functions are reachable by POST from any page, so each action checks
 * for an admin token itself. This is a fast early exit; the backend makes the
 * real decision (and re-checks the database) on every call.
 */
async function requireAdmin() {
  const token = await getAccessToken();
  if (!token) redirect("/sign-in?next=/admin");
  if (decodeJwt(token).role !== "admin") redirect("/account");
}

function text(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

/** Text fields of a submission, to refill the form after a failure. */
function echo(formData: FormData): Record<string, string> {
  const values: Record<string, string> = {};
  for (const [key, value] of formData) {
    if (typeof value === "string" && !key.startsWith("$ACTION")) values[key] = value;
  }
  return values;
}

/** Maps API errors to form state; validation details become field errors. */
function failure(error: unknown): FormState {
  if (!isApiError(error)) throw error;
  if (error.status === 0) {
    return { status: "error", message: "We can't reach the API right now. Please try again." };
  }
  const fieldErrors: Record<string, string> = {};
  if (Array.isArray(error.details)) {
    for (const detail of error.details as { path?: unknown; message?: unknown }[]) {
      if (typeof detail.path !== "string" || typeof detail.message !== "string") continue;
      const field = detail.path.split(".")[0] || "form";
      fieldErrors[field] ??= detail.message;
    }
  }
  return { status: "error", message: error.message, fieldErrors };
}

// ---- Products ----

export async function createProductAction(_previous: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const parsed = parseProductForm(formData, "create");
  if (!parsed.ok) return { ...parsed.state, values: echo(formData) };

  try {
    await createProduct(parsed.input);
  } catch (error) {
    return { ...failure(error), values: echo(formData) };
  }
  updateTag("catalog");
  redirect(`/admin/products/${parsed.input.slug}?created=1`);
}

export async function updateProductAction(_previous: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const slug = text(formData, "slug");
  const parsed = parseProductForm(formData, "edit");
  if (!parsed.ok) return { ...parsed.state, values: echo(formData) };

  // Slug and stock can't change here (stock has its own optimistic form).
  const { input } = parsed;
  try {
    await updateProduct(slug, {
      name: input.name,
      styleNumber: input.styleNumber,
      categorySlug: input.categorySlug,
      price: input.price,
      currency: input.currency,
      color: input.color,
      description: input.description,
      details: input.details,
      images: input.images,
      badge: input.badge,
      gender: input.gender,
    });
  } catch (error) {
    return { ...failure(error), values: echo(formData) };
  }
  updateTag("catalog");
  refresh();
  return { status: "saved", message: "Product saved." };
}

export async function setStockAction(_previous: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const slug = text(formData, "slug");
  const stock = Number(text(formData, "stock"));
  const expectedStock = Number(text(formData, "expectedStock"));
  if (!Number.isInteger(stock) || stock < 0) {
    return { status: "error", fieldErrors: { stock: "Enter a whole number, 0 or more." } };
  }

  try {
    await setProductStock(slug, stock, expectedStock);
  } catch (error) {
    const state = failure(error);
    if (isApiError(error, 409)) refresh(); // show the current stock
    return state;
  }
  updateTag("catalog");
  refresh();
  return { status: "saved", message: `Stock set to ${stock}.` };
}

// ---- Categories ----

export async function saveCategoryAction(_previous: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const mode = text(formData, "mode") === "edit" ? "edit" : "create";
  const parsed = parseCategoryForm(formData);
  if (!parsed.ok) return { ...parsed.state, values: echo(formData) };

  try {
    if (mode === "create") {
      await createCategory(parsed.input);
    } else {
      const { slug, ...changes } = parsed.input;
      await updateCategory(slug, changes);
    }
  } catch (error) {
    return { ...failure(error), values: echo(formData) };
  }
  updateTag("catalog");
  refresh();
  return { status: "saved", message: mode === "create" ? "Category created." : "Category saved." };
}

// ---- Orders ----

export async function updateOrderStatusAction(_previous: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const number = text(formData, "number");
  const status = text(formData, "status") as OrderStatus;
  if (!ORDER_STATUSES.includes(status)) return { status: "error", message: "Unknown status." };

  try {
    await updateOrderStatus(number, status);
  } catch (error) {
    refresh();
    return failure(error);
  }
  // Cancelling returns items to stock: product pages must show it.
  if (status === "cancelled") updateTag("catalog");
  refresh();
  return {
    status: "saved",
    message: status === "cancelled" ? "Order cancelled and items restocked." : `Order marked ${status}.`,
  };
}

// ---- Admins ----

export async function setUserRoleAction(_previous: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const id = text(formData, "id");
  const role = text(formData, "role");
  if (role !== "admin" && role !== "user") return { status: "error", message: "Unknown role." };

  try {
    const user = await setUserRole(id, role);
    refresh();
    return {
      status: "saved",
      message: role === "admin" ? `${user.name} is now an admin.` : `${user.name} is no longer an admin.`,
    };
  } catch (error) {
    return failure(error);
  }
}

// ---- Appointments ----

export async function setAppointmentStatusAction(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAdmin();
  const id = Number(text(formData, "id"));
  const status = text(formData, "status");
  if (!Number.isInteger(id) || (status !== "new" && status !== "contacted")) {
    return { status: "error", message: "Unknown request." };
  }
  try {
    await setAppointmentStatus(id, status);
  } catch (error) {
    return failure(error);
  }
  refresh();
  return { status: "saved", message: status === "contacted" ? "Marked contacted." : "Marked as new." };
}

// ---- Uploads ----

export async function uploadImageAction(formData: FormData): Promise<{ url?: string; error?: string }> {
  await requireAdmin();
  const file = formData.get("image");
  if (!(file instanceof File) || file.size === 0) return { error: "Choose an image to upload." };
  if (file.size > MAX_UPLOAD_BYTES) return { error: "Images must be 5 MB or smaller." };

  try {
    return { url: (await uploadImage(file)).url };
  } catch (error) {
    if (isApiError(error)) return { error: error.message };
    throw error;
  }
}
