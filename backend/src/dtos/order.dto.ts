import { z } from "zod";

import type { OrderWithItems } from "../models/order";
import { ImageDto, Slug } from "./common.dto";
import { MoneyDto } from "./product.dto";

/* --------------------------------------------------------------------------
   Shared shapes
   -------------------------------------------------------------------------- */

const text = (max: number) => z.string().trim().min(1).max(max);
const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((value) => (value ? value : undefined));

export const ShippingAddressDto = z.object({
  fullName: text(100),
  line1: text(200),
  line2: optionalText(200),
  city: text(100),
  postalCode: text(20),
  country: text(56),
  phone: optionalText(30),
});
export type ShippingAddressDto = z.infer<typeof ShippingAddressDto>;

/* --------------------------------------------------------------------------
   Response shapes
   -------------------------------------------------------------------------- */

export const OrderStatus = z.enum(["paid", "cancelled"]);

export const OrderItemDto = z.object({
  productSlug: Slug,
  name: z.string(),
  colorName: z.string(),
  image: ImageDto,
  unitPrice: MoneyDto,
  quantity: z.number().int().positive(),
  lineTotal: MoneyDto,
});

export const OrderDto = z.object({
  number: z.string(),
  status: OrderStatus,
  createdAt: z.iso.datetime(),
  email: z.email(),
  shippingAddress: ShippingAddressDto,
  items: z.array(OrderItemDto),
  /** Total units. */
  itemCount: z.number().int().positive(),
  subtotal: MoneyDto,
  shipping: MoneyDto,
  total: MoneyDto,
  payment: z.object({ method: z.literal("card"), last4: z.string().nullable() }),
});
export type OrderDto = z.infer<typeof OrderDto>;

/* --------------------------------------------------------------------------
   Request shapes
   -------------------------------------------------------------------------- */

export const PlaceOrderBody = z.object({
  shippingAddress: ShippingAddressDto,
  /** Payments are simulated: only the last four card digits are sent. */
  payment: z.object({ cardLast4: z.string().regex(/^\d{4}$/, "Must be 4 digits") }),
});

export const OrderNumberParams = z.object({
  number: z.string().regex(/^AT-[0-9A-Z]{8}$/, "Invalid order number"),
});

/* --------------------------------------------------------------------------
   Mapper
   -------------------------------------------------------------------------- */

export function toOrderDto(order: OrderWithItems): OrderDto {
  const money = (amount: number) => ({ amount, currency: order.currency });
  return {
    number: order.number,
    status: order.status,
    createdAt: order.createdAt.toISOString(),
    email: order.email,
    shippingAddress: {
      fullName: order.shippingAddress.fullName,
      line1: order.shippingAddress.line1,
      line2: order.shippingAddress.line2,
      city: order.shippingAddress.city,
      postalCode: order.shippingAddress.postalCode,
      country: order.shippingAddress.country,
      phone: order.shippingAddress.phone,
    },
    items: order.items.map((item) => ({
      productSlug: item.productSlug,
      name: item.name,
      colorName: item.colorName,
      image: item.image,
      unitPrice: money(item.unitPrice),
      quantity: item.quantity,
      lineTotal: money(item.unitPrice * item.quantity),
    })),
    itemCount: order.items.reduce((sum, item) => sum + item.quantity, 0),
    subtotal: money(order.subtotal),
    shipping: money(order.shipping),
    total: money(order.total),
    payment: { method: "card", last4: order.paymentLast4 },
  };
}
