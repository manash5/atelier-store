import type { OrderSummary, OrderWithCustomer } from "./order";
import type { Product } from "./product";

/** Everything the admin dashboard's home page shows. */
export type AdminOverview = {
  orders: OrderSummary;
  recentOrders: OrderWithCustomer[];
  productCount: number;
  lowStock: Product[];
  adminCount: number;
  /** Appointment requests nobody has contacted yet. */
  newAppointments: number;
};
