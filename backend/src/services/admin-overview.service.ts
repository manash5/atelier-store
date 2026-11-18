import type { AdminOverview } from "../models/admin";
import { adminCatalogService } from "./admin-catalog.service";
import { adminOrderService } from "./admin-order.service";
import { adminUserService } from "./admin-user.service";
import { appointmentService } from "./appointment.service";

const RECENT_ORDERS = 5;

export const adminOverviewService = {
  /** Everything the admin dashboard's home page shows, in one request. */
  async get(): Promise<AdminOverview> {
    const [orders, recent, productCount, lowStock, adminCount, newAppointments] = await Promise.all([
      adminOrderService.summary(),
      adminOrderService.list({ page: 1, limit: RECENT_ORDERS }),
      adminCatalogService.productCount(),
      adminCatalogService.lowStock(),
      adminUserService.adminCount(),
      appointmentService.countNew(),
    ]);
    return { orders, recentOrders: recent.items, productCount, lowStock, adminCount, newAppointments };
  },
};
