import type { PaginationMeta } from "../dtos/common.dto";

import { NotFoundError } from "../exceptions";
import { logger } from "../lib/logger";
import type { Product } from "../models/product";
import { productRepository } from "../repositories/product.repository";
import type { Page } from "../types/pagination";

export const productService = {
  async getBySlug(slug: string): Promise<Product> {
    const product = await productRepository.findBySlug(slug);
    if (!product) throw new NotFoundError(`Product "${slug}" not found`);
    return product;
  },

  /** A page of the whole catalog, in catalog order. */
  async list(page: number, limit: number): Promise<Page<Product>> {
    const [items, total] = await Promise.all([
      productRepository.findPage((page - 1) * limit, limit),
      productRepository.count(),
    ]);
    return { items, meta: { page, limit, total } };
  },

  /**
   * Curated selections (e.g. homepage edits): exactly the requested products,
   * in the requested order. Unknown slugs are skipped and logged so a renamed
   * product doesn't take a whole page down.
   */
  async listBySlugs(slugs: string[]): Promise<Page<Product>> {
    const unique = [...new Set(slugs)];
    const found = await productRepository.findBySlugs(unique);
    const bySlug = new Map(found.map((product) => [product.slug, product]));

    const items: Product[] = [];
    const missing: string[] = [];
    for (const slug of unique) {
      const product = bySlug.get(slug);
      if (product) items.push(product);
      else missing.push(slug);
    }
    if (missing.length > 0) {
      logger.warn({ missing }, "Requested product slugs not found");
    }

    const meta: PaginationMeta = { page: 1, limit: unique.length, total: items.length };
    return { items, meta };
  },

  /** Same-category products first, then the rest of the catalog. */
  async getRelated(slug: string, limit: number): Promise<Product[]> {
    const product = await productService.getBySlug(slug);
    return productRepository.findOthersPreferringCategory(
      product.id,
      product.categoryId,
      limit,
    );
  },
};
