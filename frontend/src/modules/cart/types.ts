import type { Money } from "@/shared/types/api";
import type { Image } from "@/shared/types/image";

// Hand-written mirrors of docs/api/api-contracts.md (cart and orders).

export type CartLineIssue = "sold-out" | "insufficient-stock" | null;

/** GET /api/v1/cart → items[] */
export type CartLine = {
  product: {
    slug: string;
    name: string;
    color: { name: string; hex: string };
    image: Image;
    price: Money;
    stock: number;
    stockStatus: "in-stock" | "low-stock" | "sold-out";
  };
  quantity: number;
  /** Highest quantity the shopper can choose right now (0 when sold out). */
  maxQuantity: number;
  lineTotal: Money;
  issue: CartLineIssue;
};

/** GET /api/v1/cart */
export type Cart = {
  items: CartLine[];
  /** Total units. */
  itemCount: number;
  subtotal: Money;
  /** Checkout is blocked while any line has an issue. */
  hasIssues: boolean;
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

export type OrderItem = {
  productSlug: string;
  name: string;
  colorName: string;
  image: Image;
  unitPrice: Money;
  quantity: number;
  lineTotal: Money;
};

/** Paid at checkout; then processing → shipped → delivered, or cancelled before shipping. */
export type OrderStatus = "paid" | "processing" | "shipped" | "delivered" | "cancelled";

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  paid: "Paid",
  processing: "Being prepared",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export const ORDER_STATUS_TONE: Record<OrderStatus, string> = {
  paid: "bg-success",
  processing: "bg-success",
  shipped: "bg-success",
  delivered: "bg-success",
  cancelled: "bg-ink-subtle",
};

/** GET /api/v1/orders/:number */
export type Order = {
  number: string;
  status: OrderStatus;
  createdAt: string;
  email: string;
  shippingAddress: ShippingAddress;
  items: OrderItem[];
  itemCount: number;
  subtotal: Money;
  shipping: Money;
  total: Money;
  payment: { method: "card"; last4: string | null };
};

/** State of the "Add to bag" form. */
export type AddToBagState = { status: "idle" | "added" | "error"; message?: string };

/** State of a cart line's quantity/remove forms. */
export type CartLineState = { error?: string };

export type CheckoutField =
  | "fullName"
  | "line1"
  | "line2"
  | "city"
  | "postalCode"
  | "country"
  | "phone"
  | "cardName"
  | "cardNumber"
  | "cardExpiry"
  | "cardCvc";

/** State of the checkout form. */
export type CheckoutState = {
  error?: string;
  fieldErrors?: Partial<Record<CheckoutField, string>>;
  /** Echoed back (never card data) so the form keeps what was typed. */
  values?: Partial<Record<CheckoutField, string>>;
};
