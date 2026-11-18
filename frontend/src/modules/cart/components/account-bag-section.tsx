import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";

import { formatPrice } from "@/shared/lib/format-price";
import { SectionHeading } from "@/shared/ui/section-heading";

import { getCart, getRecentOrders } from "../api/cart.service";
import { type Cart, type Order, ORDER_STATUS_LABEL } from "../types";

const PREVIEW_LIMIT = 4;
const dateFormat = new Intl.DateTimeFormat("en-US", { dateStyle: "medium" });

function BagPreview({ cart }: { cart: Cart }) {
  if (cart.items.length === 0) {
    return (
      <div className="mt-8 flex flex-col items-start gap-6 bg-surface px-6 py-10 sm:flex-row sm:items-center sm:justify-between lg:mt-10 lg:px-10">
        <div>
          <p className="type-title">Your bag is empty</p>
          <p className="mt-2 type-body text-ink-muted">
            Add pieces from any product page and they will appear here.
          </p>
        </div>
        <Link href="/collections/new-in" className="btn btn-primary shrink-0">
          Shop new arrivals
        </Link>
      </div>
    );
  }

  const preview = cart.items.slice(0, PREVIEW_LIMIT);
  const more = cart.items.length - preview.length;

  return (
    <>
      <ul className="mt-8 grid grid-cols-2 gap-x-1 gap-y-8 md:grid-cols-4 md:gap-x-2 lg:mt-10">
        {preview.map((line) => (
          <li key={line.product.slug}>
            <Link href={`/products/${line.product.slug}`} className="group block">
              <div className="media-frame aspect-product">
                <Image
                  src={line.product.image.src}
                  alt={line.product.image.alt}
                  fill
                  sizes="(min-width: 768px) 25vw, 50vw"
                  style={{ objectPosition: line.product.image.position }}
                  className="transition-transform duration-700 ease-standard group-hover:scale-[1.03]"
                />
                {line.issue ? (
                  <span className="absolute top-3 left-3 bg-canvas px-2 py-1 type-micro text-sale">
                    {line.issue === "sold-out" ? "Sold out" : `Only ${line.product.stock} left`}
                  </span>
                ) : null}
              </div>
              <div className="mt-3 flex flex-col gap-0.5 pr-2 md:mt-4">
                <h3 className="type-body group-hover:underline group-hover:underline-offset-4">
                  {line.product.name}
                </h3>
                <p className="type-body text-ink-muted">
                  Qty {line.quantity} · {formatPrice(line.lineTotal)}
                </p>
              </div>
            </Link>
          </li>
        ))}
      </ul>

      <div className="mt-8 flex flex-col gap-4 border-t pt-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="type-body text-ink-muted">
          {cart.itemCount} {cart.itemCount === 1 ? "item" : "items"}
          {more > 0 ? ` (${more} more not shown)` : ""} ·{" "}
          <span className="text-ink">Subtotal {formatPrice(cart.subtotal)}</span>
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link href="/bag" className="btn btn-secondary">
            View bag
          </Link>
          {cart.hasIssues ? null : (
            <Link href="/checkout" className="btn btn-primary">
              Checkout
            </Link>
          )}
        </div>
      </div>
    </>
  );
}

function RecentOrders({ orders }: { orders: Order[] }) {
  if (orders.length === 0) return null;
  return (
    <div className="mt-section-sm">
      <SectionHeading id="orders-title" eyebrow="History" title="Recent orders" />
      <ul className="mt-8 border-t lg:mt-10" aria-labelledby="orders-title">
        {orders.map((order) => (
          <li key={order.number} className="border-b">
            <Link
              href={`/orders/${order.number}`}
              className="group grid grid-cols-2 gap-x-6 gap-y-1 py-5 type-body sm:grid-cols-[minmax(0,1fr)_auto_auto_auto] sm:items-center"
            >
              <span className="group-hover:underline group-hover:underline-offset-4">
                {order.number}
              </span>
              <span className="text-right text-ink-muted sm:text-left">
                {dateFormat.format(new Date(order.createdAt))}
              </span>
              <span className="text-ink-muted">
                {order.itemCount} {order.itemCount === 1 ? "item" : "items"} · {ORDER_STATUS_LABEL[order.status]}
              </span>
              <span className="text-right">{formatPrice(order.total)}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

async function AccountBagContent() {
  const [cart, orders] = await Promise.all([getCart(), getRecentOrders()]);
  if (!cart) return null;
  return (
    <>
      <BagPreview cart={cart} />
      <RecentOrders orders={orders} />
    </>
  );
}

/** "Your bag" and "Recent orders" for the account page. */
export function AccountBagSection() {
  return (
    <section aria-labelledby="account-bag-title" className="container-page pb-section">
      <SectionHeading
        id="account-bag-title"
        eyebrow="Shopping bag"
        title="Your bag"
        action={{ label: "View bag", href: "/bag" }}
      />
      <Suspense fallback={<div aria-hidden className="mt-10 h-72 bg-surface" />}>
        <AccountBagContent />
      </Suspense>
    </section>
  );
}
