import { z } from "zod";

import type { AdminOverview } from "../models/admin";
import { AdminProductDto, toAdminProductDto } from "./admin-catalog.dto";
import {
  AdminOrderDto,
  AdminOrderSummaryDto,
  toAdminOrderDto,
  toAdminOrderSummaryDto,
} from "./admin-order.dto";

export const AdminOverviewDto = z.object({
  orders: AdminOrderSummaryDto,
  recentOrders: z.array(AdminOrderDto),
  productCount: z.number().int().nonnegative(),
  /** Products at or below the low-stock threshold, lowest first. */
  lowStock: z.array(AdminProductDto),
  adminCount: z.number().int().nonnegative(),
  /** Appointment requests not yet contacted. */
  newAppointments: z.number().int().nonnegative(),
});
export type AdminOverviewDto = z.infer<typeof AdminOverviewDto>;

export function toAdminOverviewDto(overview: AdminOverview): AdminOverviewDto {
  return {
    orders: toAdminOrderSummaryDto(overview.orders),
    recentOrders: overview.recentOrders.map(toAdminOrderDto),
    productCount: overview.productCount,
    lowStock: overview.lowStock.map(toAdminProductDto),
    adminCount: overview.adminCount,
    newAppointments: overview.newAppointments,
  };
}
