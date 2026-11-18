import type {
  CreateCategoryBody,
  CreateProductBody,
  UpdateCategoryBody,
  UpdateProductBody,
} from "../dtos/admin-catalog.dto";
import { AppError, ConflictError, NotFoundError } from "../exceptions";
import type { Category, CategoryWithCount } from "../models/category";
import type { Product } from "../models/product";
import {
  type AdminProductFilter,
  adminCatalogRepository,
  type ProductChanges,
} from "../repositories/admin-catalog.repository";
import type { Page } from "../types/pagination";

const LOW_STOCK_LIST_LIMIT = 8;

async function categoryOrThrow(slug: string): Promise<Category> {
  const category = await adminCatalogRepository.findCategoryBySlug(slug);
  if (!category) {
    throw new AppError(400, "VALIDATION_ERROR", `Category "${slug}" doesn't exist`, [
      { path: "categorySlug", message: "Unknown category" },
    ]);
  }
  return category;
}

async function productOrThrow(slug: string): Promise<Product> {
  const product = await adminCatalogRepository.findProductBySlug(slug);
  if (!product) throw new NotFoundError(`Product "${slug}" not found`);
  return product;
}

export const adminCatalogService = {
  async listProducts(
    params: AdminProductFilter & { page: number; limit: number },
  ): Promise<Page<Product>> {
    const { page, limit, ...filter } = params;
    const [items, total] = await Promise.all([
      adminCatalogRepository.findProductPage((page - 1) * limit, limit, filter),
      adminCatalogRepository.countProducts(filter),
    ]);
    return { items, meta: { page, limit, total } };
  },

  getProduct: productOrThrow,

  async createProduct(body: CreateProductBody): Promise<Product> {
    if (await adminCatalogRepository.slugTaken(body.slug)) {
      throw new ConflictError(`The URL slug "${body.slug}" is already used`, [
        { path: "slug", message: "Already used" },
      ]);
    }
    if (await adminCatalogRepository.styleNumberTaken(body.styleNumber)) {
      throw new ConflictError(`Style number ${body.styleNumber} is already used`, [
        { path: "styleNumber", message: "Already used" },
      ]);
    }
    const category = await categoryOrThrow(body.categorySlug);

    await adminCatalogRepository.insertProduct({
      slug: body.slug,
      categoryId: category.id,
      name: body.name,
      styleNumber: body.styleNumber,
      price: body.price,
      currency: body.currency,
      colorName: body.color.name,
      colorHex: body.color.hex,
      stock: body.stock,
      description: body.description,
      details: body.details,
      images: body.images as Product["images"],
      badge: body.badge,
      gender: body.gender,
    });
    return productOrThrow(body.slug);
  },

  async updateProduct(slug: string, body: UpdateProductBody): Promise<Product> {
    const product = await productOrThrow(slug);
    if (
      body.styleNumber !== undefined &&
      body.styleNumber !== product.styleNumber &&
      (await adminCatalogRepository.styleNumberTaken(body.styleNumber, product.id))
    ) {
      throw new ConflictError(`Style number ${body.styleNumber} is already used`, [
        { path: "styleNumber", message: "Already used" },
      ]);
    }

    const changes: ProductChanges = {};
    if (body.name !== undefined) changes.name = body.name;
    if (body.styleNumber !== undefined) changes.styleNumber = body.styleNumber;
    if (body.categorySlug !== undefined) changes.categoryId = (await categoryOrThrow(body.categorySlug)).id;
    if (body.price !== undefined) changes.price = body.price;
    if (body.currency !== undefined) changes.currency = body.currency;
    if (body.color !== undefined) {
      changes.colorName = body.color.name;
      changes.colorHex = body.color.hex;
    }
    if (body.description !== undefined) changes.description = body.description;
    if (body.details !== undefined) changes.details = body.details;
    if (body.images !== undefined) changes.images = body.images as Product["images"];
    if (body.badge !== undefined) changes.badge = body.badge;
    if (body.gender !== undefined) changes.gender = body.gender;

    await adminCatalogRepository.updateProduct(product.id, changes);
    return productOrThrow(slug);
  },

  /** 409 with the current stock if it changed since the admin loaded it. */
  async setStock(slug: string, stock: number, expectedStock: number): Promise<Product> {
    const product = await productOrThrow(slug);
    const applied = await adminCatalogRepository.setStock(product.id, expectedStock, stock);
    if (!applied) {
      const current = await productOrThrow(slug);
      throw new ConflictError(
        `Stock changed to ${current.stock} since you loaded this page (an order may have been placed). Review it and save again.`,
        { stock: current.stock },
      );
    }
    return productOrThrow(slug);
  },

  async lowStock(): Promise<Product[]> {
    return adminCatalogRepository.findLowStock(LOW_STOCK_LIST_LIMIT);
  },

  async productCount(): Promise<number> {
    return adminCatalogRepository.countAllProducts();
  },

  // ---- Categories ----

  async listCategories(): Promise<CategoryWithCount[]> {
    return adminCatalogRepository.findCategoriesWithCounts();
  },

  async createCategory(body: CreateCategoryBody): Promise<CategoryWithCount> {
    if (await adminCatalogRepository.findCategoryBySlug(body.slug)) {
      throw new ConflictError(`The URL slug "${body.slug}" is already used`, [
        { path: "slug", message: "Already used" },
      ]);
    }
    await adminCatalogRepository.insertCategory({
      slug: body.slug,
      title: body.title,
      image: body.image,
      sortOrder: body.sortOrder ?? (await adminCatalogRepository.nextCategorySortOrder()),
    });
    return this.getCategory(body.slug);
  },

  async updateCategory(slug: string, body: UpdateCategoryBody): Promise<CategoryWithCount> {
    const category = await adminCatalogRepository.findCategoryBySlug(slug);
    if (!category) throw new NotFoundError(`Category "${slug}" not found`);
    await adminCatalogRepository.updateCategory(category.id, {
      ...(body.title !== undefined ? { title: body.title } : {}),
      ...(body.image !== undefined ? { image: body.image } : {}),
      ...(body.sortOrder !== undefined ? { sortOrder: body.sortOrder } : {}),
    });
    return this.getCategory(slug);
  },

  async getCategory(slug: string): Promise<CategoryWithCount> {
    const all = await adminCatalogRepository.findCategoriesWithCounts();
    const category = all.find((item) => item.slug === slug);
    if (!category) throw new NotFoundError(`Category "${slug}" not found`);
    return category;
  },
};
