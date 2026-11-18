import { z } from "zod";

import { ORDER_TRANSITIONS, type OrderSummary, type OrderWithCustomer } from "../models/order";
import { MoneyDto } from "./product.dto";
import { OrderDto, OrderStatus, toOrderDto } from "./order.dto";

/* --------------------------------------------------------------------------
   Response shapes
   -------------------------------------------------------------------------- */

export const AdminOrderDto = OrderDto.extend({
  updatedAt: z.iso.datetime(),
  /** The account that placed the order; null if it was deleted. */
  customer: z.object({ id: z.string(), name: z.string(), email: z.email() }).nullable(),
  /** Statuses this order can move to next (empty when final). */
  nextStatuses: z.array(OrderStatus),
});
export type AdminOrderDto = z.infer<typeof AdminOrderDto>;

export const AdminOrderSummaryDto = z.object({
  byStatus: z.record(OrderStatus, z.number().int().nonnegative()),
  /** Total of orders that weren't cancelled. */
  revenue: MoneyDto,
});
export type AdminOrderSummaryDto = z.infer<typeof AdminOrderSummaryDto>;

/* --------------------------------------------------------------------------
   Request shapes
   -------------------------------------------------------------------------- */

export const AdminOrderListQuery = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(25),
  status: OrderStatus.optional(),
  /** Partial order number or email. */
  q: z
    .string()
    .trim()
    .max(100)
    .optional()
    .transform((value) => (value ? value : undefined)),
});

/** Admins may type references in lower case. */
export const AdminOrderNumberParams = z.object({
  number: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^AT-[0-9A-Z]{8}$/, "Invalid order number"),
});

export const UpdateOrderStatusBody = z.object({ status: OrderStatus });

/* --------------------------------------------------------------------------
   Mappers
   -------------------------------------------------------------------------- */

export function toAdminOrderDto(order: OrderWithCustomer): AdminOrderDto {
  return {
    ...toOrderDto(order),
    updatedAt: order.updatedAt.toISOString(),
    customer: order.user,
    nextStatuses: [...ORDER_TRANSITIONS[order.status]],
  };
}

export function toAdminOrderSummaryDto(summary: OrderSummary): AdminOrderSummaryDto {
  return {
    byStatus: {
      paid: summary.byStatus.paid ?? 0,
      processing: summary.byStatus.processing ?? 0,
      shipped: summary.byStatus.shipped ?? 0,
      delivered: summary.byStatus.delivered ?? 0,
      cancelled: summary.byStatus.cancelled ?? 0,
    },
    revenue: { amount: summary.revenue, currency: summary.currency ?? "USD" },
  };
}
