import { Router } from "express";

import {
  adminCategoryController,
  adminOrderController,
  adminOverviewController,
  adminProductController,
  adminUserController,
} from "../controllers/admin.controller";
import { adminAppointmentController } from "../controllers/appointment.controller";
import { uploadController } from "../controllers/upload.controller";
import {
  AdminAppointmentListQuery,
  AppointmentParams,
  UpdateAppointmentStatusBody,
} from "../dtos/appointment.dto";
import {
  AdminCategoryParams,
  AdminProductListQuery,
  AdminProductParams,
  CreateCategoryBody,
  CreateProductBody,
  SetStockBody,
  UpdateCategoryBody,
  UpdateProductBody,
} from "../dtos/admin-catalog.dto";
import {
  AdminOrderListQuery,
  AdminOrderNumberParams,
  UpdateOrderStatusBody,
} from "../dtos/admin-order.dto";
import { AdminUserListQuery, AdminUserParams, SetUserRoleBody } from "../dtos/admin-user.dto";
import { auditAdminWrites, authorize, authorizeAdmin } from "../middleware/auth.middleware";
import { uploadImage } from "../middleware/upload.middleware";
import { validate } from "../middleware/validate";

/**
 * Everything here requires an admin access token, re-checked against the
 * database on every request, and every write is audit-logged.
 */
export const adminRouter = Router();

adminRouter.use(authorize, authorizeAdmin, auditAdminWrites);

adminRouter.get("/overview", adminOverviewController.get);

// Auth runs before multer, so anonymous or non-admin uploads are rejected
// before any bytes are written to disk.
adminRouter.post("/uploads", uploadImage, uploadController.create);

// Products: create and edit (no deletion); the slug is fixed at creation.
adminRouter.get("/products", validate({ query: AdminProductListQuery }), adminProductController.list);
adminRouter.post("/products", validate({ body: CreateProductBody }), adminProductController.create);
adminRouter.get("/products/:slug", validate({ params: AdminProductParams }), adminProductController.get);
adminRouter.patch(
  "/products/:slug",
  validate({ params: AdminProductParams, body: UpdateProductBody }),
  adminProductController.update,
);
adminRouter.put(
  "/products/:slug/stock",
  validate({ params: AdminProductParams, body: SetStockBody }),
  adminProductController.setStock,
);

// Categories: create and edit.
adminRouter.get("/categories", adminCategoryController.list);
adminRouter.post("/categories", validate({ body: CreateCategoryBody }), adminCategoryController.create);
adminRouter.patch(
  "/categories/:slug",
  validate({ params: AdminCategoryParams, body: UpdateCategoryBody }),
  adminCategoryController.update,
);

// Orders across all customers.
adminRouter.get("/orders", validate({ query: AdminOrderListQuery }), adminOrderController.list);
adminRouter.get("/orders/:number", validate({ params: AdminOrderNumberParams }), adminOrderController.get);
adminRouter.patch(
  "/orders/:number/status",
  validate({ params: AdminOrderNumberParams, body: UpdateOrderStatusBody }),
  adminOrderController.updateStatus,
);

// Users and admin access.
adminRouter.get("/users", validate({ query: AdminUserListQuery }), adminUserController.list);
adminRouter.patch(
  "/users/:id/role",
  validate({ params: AdminUserParams, body: SetUserRoleBody }),
  adminUserController.setRole,
);

// Appointment requests from the public booking form.
adminRouter.get(
  "/appointments",
  validate({ query: AdminAppointmentListQuery }),
  adminAppointmentController.list,
);
adminRouter.patch(
  "/appointments/:id/status",
  validate({ params: AppointmentParams, body: UpdateAppointmentStatusBody }),
  adminAppointmentController.setStatus,
);
