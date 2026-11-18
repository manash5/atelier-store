import type { Money, PaginationMeta } from "@/shared/types/api";
import type { Image } from "@/shared/types/image";

// Hand-written mirrors of docs/api/api-contracts.md (admin section).

export type OrderStatus = "paid" | "processing" | "shipped" | "delivered" | "cancelled";
export type StockStatus = "in-stock" | "low-stock" | "sold-out";
export type ProductBadge = "New" | "Limited";
export type ProductGender = "women" | "men" | "unisex";

export type AdminProduct = {
  slug: string;
  name: string;
  styleNumber: string;
  category: { slug: string; title: string };
  price: Money;
  color: { name: string; hex: string };
  stock: number;
  stockStatus: StockStatus;
  description: string;
  details: string[];
  images: [Image, ...Image[]];
  badge: ProductBadge | null;
  gender: ProductGender;
  createdAt: string;
  updatedAt: string;
};

export type AdminCategory = {
  slug: string;
  title: string;
  image: Image | null;
  sortOrder: number;
  productCount: number;
};

export type ShippingAddress = {
  fullName: string;
  line1: string;
  line2?: string;
  city: string;
  postalCode: string;
  country: string;
  phone?: string;
};

export type AdminOrder = {
  number: string;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
  email: string;
  shippingAddress: ShippingAddress;
  items: {
    productSlug: string;
    name: string;
    colorName: string;
    image: Image;
    unitPrice: Money;
    quantity: number;
    lineTotal: Money;
  }[];
  itemCount: number;
  subtotal: Money;
  shipping: Money;
  total: Money;
  payment: { method: "card"; last4: string | null };
  customer: { id: string; name: string; email: string } | null;
  nextStatuses: OrderStatus[];
};

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: "admin" | "user";
  emailVerified: boolean;
  banned: boolean;
  createdAt: string;
};

export type AdminOverview = {
  orders: { byStatus: Record<OrderStatus, number>; revenue: Money };
  recentOrders: AdminOrder[];
  productCount: number;
  lowStock: AdminProduct[];
  adminCount: number;
  /** Appointment requests not yet contacted. */
  newAppointments: number;
};

export type AppointmentStatus = "new" | "contacted";

/** GET /admin/appointments */
export type AdminAppointment = {
  id: number;
  name: string;
  email: string;
  phone: string;
  type: "in_store" | "video";
  preferredDate: string | null;
  note: string | null;
  status: AppointmentStatus;
  hasAccount: boolean;
  createdAt: string;
  updatedAt: string;
};

export type Paged<T> = { items: T[]; meta: PaginationMeta };

/** Body of POST /admin/products (PATCH takes any subset without slug/stock). */
export type ProductInput = {
  slug: string;
  name: string;
  styleNumber: string;
  categorySlug: string;
  price: number;
  currency: string;
  color: { name: string; hex: string };
  stock: number;
  description: string;
  details: string[];
  images: Image[];
  badge: ProductBadge | null;
  gender: ProductGender;
};

export type CategoryInput = {
  slug: string;
  title: string;
  image: Image | null;
  sortOrder?: number;
};

/** Result of an admin form action. */
export type FormState = {
  status?: "saved" | "error";
  message?: string;
  /** Keyed by the first segment of the API's validation path (e.g. `price`, `images`). */
  fieldErrors?: Record<string, string>;
  /**
   * What was submitted, echoed back after a failure so the form can be
   * refilled (React resets uncontrolled forms after an action runs).
   */
  values?: Record<string, string>;
};
