import type { Request, Response } from "express";

import {
  AdminCategoryParams,
  AdminProductListQuery,
  AdminProductParams,
  CreateCategoryBody,
  CreateProductBody,
  SetStockBody,
  toAdminCategoryDto,
  toAdminProductDto,
  UpdateCategoryBody,
  UpdateProductBody,
} from "../dtos/admin-catalog.dto";
import {
  AdminOrderListQuery,
  AdminOrderNumberParams,
  toAdminOrderDto,
  UpdateOrderStatusBody,
} from "../dtos/admin-order.dto";
import { toAdminOverviewDto } from "../dtos/admin-overview.dto";
import {
  AdminUserListQuery,
  AdminUserParams,
  SetUserRoleBody,
  toAdminUserDto,
} from "../dtos/admin-user.dto";
import { validated } from "../middleware/validate";
import { adminCatalogService } from "../services/admin-catalog.service";
import { adminOrderService } from "../services/admin-order.service";
import { adminOverviewService } from "../services/admin-overview.service";
import { adminUserService } from "../services/admin-user.service";
import { sendCreated, sendOk } from "../utils/http-response";

// Every route requires `authorize` + `authorizeAdmin` (see admin.routes.ts).

export const adminOverviewController = {
  async get(_req: Request, res: Response) {
    sendOk(res, toAdminOverviewDto(await adminOverviewService.get()));
  },
};

export const adminProductController = {
  async list(req: Request, res: Response) {
    const { page, limit, q, category, stock } = validated(req, "query", AdminProductListQuery);
    const result = await adminCatalogService.listProducts({
      page,
      limit,
      search: q,
      categorySlug: category,
      stock,
    });
    sendOk(res, result.items.map(toAdminProductDto), result.meta);
  },

  async get(req: Request, res: Response) {
    const { slug } = validated(req, "params", AdminProductParams);
    sendOk(res, toAdminProductDto(await adminCatalogService.getProduct(slug)));
  },

  async create(req: Request, res: Response) {
    const body = validated(req, "body", CreateProductBody);
    sendCreated(res, toAdminProductDto(await adminCatalogService.createProduct(body)));
  },

  async update(req: Request, res: Response) {
    const { slug } = validated(req, "params", AdminProductParams);
    const body = validated(req, "body", UpdateProductBody);
    sendOk(res, toAdminProductDto(await adminCatalogService.updateProduct(slug, body)));
  },

  async setStock(req: Request, res: Response) {
    const { slug } = validated(req, "params", AdminProductParams);
    const { stock, expectedStock } = validated(req, "body", SetStockBody);
    sendOk(res, toAdminProductDto(await adminCatalogService.setStock(slug, stock, expectedStock)));
  },
};

export const adminCategoryController = {
  async list(_req: Request, res: Response) {
    sendOk(res, (await adminCatalogService.listCategories()).map(toAdminCategoryDto));
  },

  async create(req: Request, res: Response) {
    const body = validated(req, "body", CreateCategoryBody);
    sendCreated(res, toAdminCategoryDto(await adminCatalogService.createCategory(body)));
  },

  async update(req: Request, res: Response) {
    const { slug } = validated(req, "params", AdminCategoryParams);
    const body = validated(req, "body", UpdateCategoryBody);
    sendOk(res, toAdminCategoryDto(await adminCatalogService.updateCategory(slug, body)));
  },
};

export const adminOrderController = {
  async list(req: Request, res: Response) {
    const { page, limit, status, q } = validated(req, "query", AdminOrderListQuery);
    const result = await adminOrderService.list({ page, limit, status, search: q });
    sendOk(res, result.items.map(toAdminOrderDto), result.meta);
  },

  async get(req: Request, res: Response) {
    const { number } = validated(req, "params", AdminOrderNumberParams);
    sendOk(res, toAdminOrderDto(await adminOrderService.get(number)));
  },

  async updateStatus(req: Request, res: Response) {
    const { number } = validated(req, "params", AdminOrderNumberParams);
    const { status } = validated(req, "body", UpdateOrderStatusBody);
    sendOk(res, toAdminOrderDto(await adminOrderService.updateStatus(number, status)));
  },
};

export const adminUserController = {
  async list(req: Request, res: Response) {
    const { page, limit, q, role } = validated(req, "query", AdminUserListQuery);
    const result = await adminUserService.list({ page, limit, search: q, role });
    sendOk(res, result.items.map(toAdminUserDto), result.meta);
  },

  async setRole(req: Request, res: Response) {
    const { id } = validated(req, "params", AdminUserParams);
    const { role } = validated(req, "body", SetUserRoleBody);
    sendOk(res, toAdminUserDto(await adminUserService.setRole(req.user!.sub, id, role)));
  },
};
