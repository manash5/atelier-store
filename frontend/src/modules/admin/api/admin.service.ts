import "server-only";

import { authedServerApi } from "@/shared/api/server-client";
import type { ApiSuccess, PaginationMeta } from "@/shared/types/api";

import type {
  AdminAppointment,
  AdminCategory,
  AdminOrder,
  AdminOverview,
  AdminProduct,
  AdminUser,
  AppointmentStatus,
  CategoryInput,
  OrderStatus,
  Paged,
  ProductInput,
} from "../types";

// Admin endpoints (/api/v1/admin/*). Request-specific: never call inside
// 'use cache'; render callers inside <Suspense>. The backend re-checks the
// admin role on every call.

type Query = Record<string, string | number | undefined>;

function clean(query: Query): Record<string, string | number> {
  return Object.fromEntries(
    Object.entries(query).filter(([, value]) => value !== undefined && value !== ""),
  ) as Record<string, string | number>;
}

async function get<T>(url: string, params?: Query): Promise<T> {
  const api = await authedServerApi();
  const { data } = await api.get<ApiSuccess<T>>(`/admin${url}`, { params: params && clean(params) });
  return data.data;
}

async function getPage<T>(url: string, params: Query): Promise<Paged<T>> {
  const api = await authedServerApi();
  const { data } = await api.get<{ data: T[]; meta: PaginationMeta }>(`/admin${url}`, {
    params: clean(params),
  });
  return { items: data.data, meta: data.meta };
}

async function send<T>(method: "post" | "patch" | "put", url: string, body: unknown): Promise<T> {
  const api = await authedServerApi();
  const { data } = await api.request<ApiSuccess<T>>({ method, url: `/admin${url}`, data: body });
  return data.data;
}

const enc = encodeURIComponent;

export const getOverview = () => get<AdminOverview>("/overview");

export const listProducts = (query: { page?: number; q?: string; category?: string; stock?: string }) =>
  getPage<AdminProduct>("/products", { limit: 20, ...query });
export const getProduct = (slug: string) => get<AdminProduct>(`/products/${enc(slug)}`);
export const createProduct = (input: ProductInput) => send<AdminProduct>("post", "/products", input);
export const updateProduct = (slug: string, input: Partial<Omit<ProductInput, "slug" | "stock">>) =>
  send<AdminProduct>("patch", `/products/${enc(slug)}`, input);
export const setProductStock = (slug: string, stock: number, expectedStock: number) =>
  send<AdminProduct>("put", `/products/${enc(slug)}/stock`, { stock, expectedStock });

export const listCategories = () => get<AdminCategory[]>("/categories");
export const createCategory = (input: CategoryInput) => send<AdminCategory>("post", "/categories", input);
export const updateCategory = (slug: string, input: Partial<Omit<CategoryInput, "slug">>) =>
  send<AdminCategory>("patch", `/categories/${enc(slug)}`, input);

export const listOrders = (query: { page?: number; q?: string; status?: string }) =>
  getPage<AdminOrder>("/orders", { limit: 20, ...query });
export const getOrder = (number: string) => get<AdminOrder>(`/orders/${enc(number)}`);
export const updateOrderStatus = (number: string, status: OrderStatus) =>
  send<AdminOrder>("patch", `/orders/${enc(number)}/status`, { status });

export const listUsers = (query: { page?: number; q?: string; role?: string }) =>
  getPage<AdminUser>("/users", { limit: 20, ...query });
export const setUserRole = (id: string, role: "admin" | "user") =>
  send<AdminUser>("patch", `/users/${enc(id)}/role`, { role });

export const listAppointments = (query: { page?: number; q?: string; status?: string }) =>
  getPage<AdminAppointment>("/appointments", { limit: 20, ...query });
export const setAppointmentStatus = (id: number, status: AppointmentStatus) =>
  send<AdminAppointment>("patch", `/appointments/${id}/status`, { status });

/** POST /admin/uploads: returns the stored file's URL (`/uploads/<uuid>.<ext>`). */
export async function uploadImage(file: File): Promise<{ url: string }> {
  const api = await authedServerApi();
  const form = new FormData();
  form.append("image", file, file.name);
  const { data } = await api.post<ApiSuccess<{ url: string }>>("/admin/uploads", form);
  return data.data;
}
