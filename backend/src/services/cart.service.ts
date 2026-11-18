import { ConflictError, NotFoundError } from "../exceptions";
import {
  type Cart,
  type CartLine,
  deriveLineIssue,
  MAX_QUANTITY_PER_ITEM,
  maxQuantityFor,
} from "../models/cart";
import type { Product } from "../models/product";
import { cartRepository } from "../repositories/cart.repository";
import { productRepository } from "../repositories/product.repository";

const DEFAULT_CURRENCY = "USD";

function summarize(lines: CartLine[]): Cart {
  let itemCount = 0;
  let subtotal = 0;
  let hasIssues = false;
  for (const line of lines) {
    itemCount += line.quantity;
    subtotal += line.product.price * line.quantity;
    if (deriveLineIssue(line.quantity, line.product.stock)) hasIssues = true;
  }
  return {
    lines,
    itemCount,
    subtotal,
    currency: lines[0]?.product.currency ?? DEFAULT_CURRENCY,
    hasIssues,
  };
}

async function productOrThrow(slug: string): Promise<Product> {
  const product = await productRepository.findBySlug(slug);
  if (!product) throw new NotFoundError(`Product "${slug}" not found`);
  return product;
}

/** 409 unless `quantity` units of the product can be held in the bag. */
function assertAvailable(product: Product, quantity: number, alreadyInBag: number) {
  if (product.stock <= 0) {
    throw new ConflictError(`${product.name} is sold out`);
  }
  const max = maxQuantityFor(product.stock);
  if (quantity > max) {
    const reason =
      max < MAX_QUANTITY_PER_ITEM
        ? `Only ${product.stock} of ${product.name} ${product.stock === 1 ? "is" : "are"} available`
        : `You can add up to ${MAX_QUANTITY_PER_ITEM} of each item`;
    const held = alreadyInBag > 0 ? ` and ${alreadyInBag} ${alreadyInBag === 1 ? "is" : "are"} already in your bag` : "";
    throw new ConflictError(`${reason}${held}.`, { maxQuantity: max, inBag: alreadyInBag });
  }
}

export const cartService = {
  /** The cart with live prices and stock; lines are never silently changed. */
  async get(userId: string): Promise<Cart> {
    return summarize(await cartRepository.findLines(userId));
  },

  async count(userId: string): Promise<number> {
    return cartRepository.countUnits(userId);
  },

  /** Adds `quantity` units (merging with an existing line). */
  async add(userId: string, slug: string, quantity: number): Promise<Cart> {
    const product = await productOrThrow(slug);
    const existing = await cartRepository.findItem(userId, product.id);
    const inBag = existing?.quantity ?? 0;
    assertAvailable(product, inBag + quantity, inBag);
    await cartRepository.setQuantity(userId, product.id, inBag + quantity);
    return this.get(userId);
  },

  /** Replaces the quantity of a line already in the bag. */
  async setQuantity(userId: string, slug: string, quantity: number): Promise<Cart> {
    const product = await productOrThrow(slug);
    const existing = await cartRepository.findItem(userId, product.id);
    if (!existing) throw new NotFoundError(`${product.name} is not in your bag`);
    // Lowering the quantity is always allowed, even if stock has dropped.
    if (quantity > existing.quantity) assertAvailable(product, quantity, 0);
    await cartRepository.setQuantity(userId, product.id, quantity);
    return this.get(userId);
  },

  async remove(userId: string, slug: string): Promise<Cart> {
    const product = await productOrThrow(slug);
    const removed = await cartRepository.remove(userId, product.id);
    if (!removed) throw new NotFoundError(`${product.name} is not in your bag`);
    return this.get(userId);
  },
};
