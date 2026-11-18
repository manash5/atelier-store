import { z } from "zod";

import { type Cart, deriveLineIssue, MAX_QUANTITY_PER_ITEM, maxQuantityFor } from "../models/cart";
import { deriveStockStatus } from "../models/product";
import { ImageDto, Slug } from "./common.dto";
import { MoneyDto, StockStatus } from "./product.dto";

/* --------------------------------------------------------------------------
   Response shapes
   -------------------------------------------------------------------------- */

export const CartLineIssue = z.enum(["sold-out", "insufficient-stock"]).nullable();

export const CartLineDto = z.object({
  product: z.object({
    slug: Slug,
    name: z.string(),
    color: z.object({ name: z.string(), hex: z.string() }),
    image: ImageDto,
    price: MoneyDto,
    stock: z.number().int().nonnegative(),
    stockStatus: StockStatus,
  }),
  quantity: z.number().int().positive(),
  /** Highest quantity the shopper can choose right now (0 when sold out). */
  maxQuantity: z.number().int().nonnegative(),
  lineTotal: MoneyDto,
  /** Set when the line can't be checked out as it is. */
  issue: CartLineIssue,
});
export type CartLineDto = z.infer<typeof CartLineDto>;

export const CartDto = z.object({
  items: z.array(CartLineDto),
  /** Total units across all lines. */
  itemCount: z.number().int().nonnegative(),
  subtotal: MoneyDto,
  /** True when any line has an `issue`; checkout is blocked until resolved. */
  hasIssues: z.boolean(),
});
export type CartDto = z.infer<typeof CartDto>;

export const CartCountDto = z.object({ count: z.number().int().nonnegative() });
export type CartCountDto = z.infer<typeof CartCountDto>;

/* --------------------------------------------------------------------------
   Request shapes
   -------------------------------------------------------------------------- */

const Quantity = z.number().int().min(1).max(MAX_QUANTITY_PER_ITEM);

export const AddCartItemBody = z.object({
  productSlug: Slug,
  quantity: Quantity.default(1),
});

export const UpdateCartItemBody = z.object({ quantity: Quantity });

export const CartItemParams = z.object({ slug: Slug });

/* --------------------------------------------------------------------------
   Mapper
   -------------------------------------------------------------------------- */

export function toCartDto(cart: Cart): CartDto {
  return {
    items: cart.lines.map((line) => {
      const { product } = line;
      return {
        product: {
          slug: product.slug,
          name: product.name,
          color: { name: product.colorName, hex: product.colorHex },
          image: product.images[0],
          price: { amount: product.price, currency: product.currency },
          stock: product.stock,
          stockStatus: deriveStockStatus(product.stock),
        },
        quantity: line.quantity,
        maxQuantity: maxQuantityFor(product.stock),
        lineTotal: { amount: product.price * line.quantity, currency: product.currency },
        issue: deriveLineIssue(line.quantity, product.stock),
      };
    }),
    itemCount: cart.itemCount,
    subtotal: { amount: cart.subtotal, currency: cart.currency },
    hasIssues: cart.hasIssues,
  };
}
