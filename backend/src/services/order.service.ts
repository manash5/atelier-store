import { randomInt } from "node:crypto";

import { AppError, ConflictError, NotFoundError } from "../exceptions";
import { deriveLineIssue } from "../models/cart";
import { type OrderWithItems, SHIPPING_COST, type ShippingAddress } from "../models/order";
import { cartRepository } from "../repositories/cart.repository";
import { orderRepository } from "../repositories/order.repository";

const RECENT_ORDERS_LIMIT = 10;
// No 0/O or 1/I so references are easy to read out.
const NUMBER_ALPHABET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";

function newOrderNumber(): string {
  let suffix = "";
  for (let i = 0; i < 8; i++) suffix += NUMBER_ALPHABET[randomInt(NUMBER_ALPHABET.length)];
  return `AT-${suffix}`;
}

async function uniqueOrderNumber(): Promise<string> {
  for (let attempt = 0; attempt < 5; attempt++) {
    const number = newOrderNumber();
    if (!(await orderRepository.numberExists(number))) return number;
  }
  throw new Error("Could not generate a unique order number");
}

export type PlaceOrderInput = {
  userId: string;
  email: string;
  shippingAddress: ShippingAddress;
  /** Payments are simulated: only the last four digits are kept, for display. */
  cardLast4: string;
};

export const orderService = {
  /**
   * Turns the cart into a paid order. Stock is checked here for a clear
   * message and again atomically in the repository, so a concurrent sale
   * can't oversell.
   */
  async place(input: PlaceOrderInput): Promise<OrderWithItems> {
    const lines = await cartRepository.findLines(input.userId);
    if (lines.length === 0) {
      throw new AppError(400, "BAD_REQUEST", "Your bag is empty");
    }

    const unavailable = lines.filter((line) => deriveLineIssue(line.quantity, line.product.stock));
    if (unavailable.length > 0) {
      throw new ConflictError(
        "Some items in your bag are no longer available in the quantity you chose",
        unavailable.map((line) => ({ path: line.product.slug, message: line.product.name })),
      );
    }

    const currencies = new Set(lines.map((line) => line.product.currency));
    if (currencies.size > 1) {
      throw new AppError(400, "BAD_REQUEST", "Items in different currencies can't be ordered together");
    }

    const subtotal = lines.reduce((sum, line) => sum + line.product.price * line.quantity, 0);
    const result = await orderRepository.placeFromCart({
      number: await uniqueOrderNumber(),
      userId: input.userId,
      email: input.email,
      shippingAddress: input.shippingAddress,
      subtotal,
      shipping: SHIPPING_COST,
      total: subtotal + SHIPPING_COST,
      currency: lines[0]!.product.currency,
      paymentLast4: input.cardLast4,
      lines,
    });

    if (!result.ok) {
      const sold = lines.filter((line) => result.outOfStockProductIds.includes(line.productId));
      throw new ConflictError(
        "Some items sold out while you were checking out",
        sold.map((line) => ({ path: line.product.slug, message: line.product.name })),
      );
    }
    return result.order;
  },

  async get(userId: string, number: string): Promise<OrderWithItems> {
    const order = await orderRepository.findByNumber(userId, number);
    if (!order) throw new NotFoundError(`Order ${number} not found`);
    return order;
  },

  async listRecent(userId: string): Promise<OrderWithItems[]> {
    return orderRepository.findRecent(userId, RECENT_ORDERS_LIMIT);
  },
};
