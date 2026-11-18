import { ConflictError, NotFoundError } from "../exceptions";
import {
  canTransition,
  type OrderStatus,
  type OrderSummary,
  type OrderWithCustomer,
} from "../models/order";
import { type AdminOrderFilter, adminOrderRepository } from "../repositories/admin-order.repository";
import type { Page } from "../types/pagination";

export const adminOrderService = {
  async list(
    params: AdminOrderFilter & { page: number; limit: number },
  ): Promise<Page<OrderWithCustomer>> {
    const { page, limit, ...filter } = params;
    const [items, total] = await Promise.all([
      adminOrderRepository.findPage((page - 1) * limit, limit, filter),
      adminOrderRepository.count(filter),
    ]);
    return { items, meta: { page, limit, total } };
  },

  async get(number: string): Promise<OrderWithCustomer> {
    const order = await adminOrderRepository.findByNumber(number);
    if (!order) throw new NotFoundError(`Order ${number} not found`);
    return order;
  },

  /**
   * Applies an allowed status change (see ORDER_TRANSITIONS). Cancelling
   * restocks the order's items. 409 if the change isn't allowed from the
   * current status or someone else changed the order first.
   */
  async updateStatus(number: string, to: OrderStatus): Promise<OrderWithCustomer> {
    const order = await this.get(number);
    if (order.status === to) return order;
    if (!canTransition(order.status, to)) {
      throw new ConflictError(`An order that is ${order.status} can't be marked ${to}`, {
        status: order.status,
      });
    }
    const applied = await adminOrderRepository.transition(order.id, order.status, to);
    if (!applied) {
      throw new ConflictError("This order was updated by someone else. Reload and try again.");
    }
    return this.get(number);
  },

  async summary(): Promise<OrderSummary> {
    return adminOrderRepository.summary();
  },
};
