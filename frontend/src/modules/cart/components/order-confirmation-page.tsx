import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { getOrder } from "../api/cart.service";
import { OrderItemList } from "./order-item-list";
import { OrderTotals } from "./order-totals";

const dateFormat = new Intl.DateTimeFormat("en-US", { dateStyle: "long" });

async function OrderContent({ params }: { params: Promise<{ number: string }> }) {
  const { number } = await params;
  const order = await getOrder(number);
  if (!order) notFound();

  const address = order.shippingAddress;
  const addressLines = [
    address.fullName,
    address.line1,
    address.line2,
    `${address.city} ${address.postalCode}`,
    address.country,
    address.phone,
  ].filter(Boolean);

  return (
    <>
      <header className="container-prose flex flex-col items-center pt-section-sm pb-10 text-center lg:pb-14">
        <span
          aria-hidden="true"
          className="flex size-12 items-center justify-center rounded-full bg-success text-canvas"
        >
          <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="m5 12.5 4.5 4.5L19 7.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
        <p className="mt-6 type-label text-ink-muted">Order confirmed</p>
        <h1 className="mt-4 type-display">Thank you</h1>
        <p className="mt-5 type-body-lg text-ink-muted">
          Your order <span className="text-ink">{order.number}</span> has been placed. We&apos;ll
          send a confirmation to {order.email}.
        </p>
      </header>

      <div className="container-content grid gap-10 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-16">
        <section aria-labelledby="order-items-title">
          <h2 id="order-items-title" className="border-y py-4 type-label text-ink-muted">
            {order.itemCount} {order.itemCount === 1 ? "item" : "items"}
          </h2>
          <div className="py-6">
            <OrderItemList
              items={order.items.map((item) => ({
                key: item.productSlug,
                name: item.name,
                colorName: item.colorName,
                image: item.image,
                quantity: item.quantity,
                lineTotal: item.lineTotal,
              }))}
            />
          </div>
          <div className="border-t pt-6">
            <OrderTotals
              itemCount={order.itemCount}
              subtotal={order.subtotal}
              shipping={order.shipping}
              total={order.total}
            />
          </div>
        </section>

        <aside className="flex flex-col gap-8 self-start bg-surface px-6 py-8 lg:px-8">
          <div>
            <h2 className="type-label text-ink-muted">Order details</h2>
            <dl className="mt-4 flex flex-col gap-2 type-body">
              <div className="flex justify-between gap-4">
                <dt className="text-ink-muted">Order</dt>
                <dd>{order.number}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-ink-muted">Placed</dt>
                <dd>{dateFormat.format(new Date(order.createdAt))}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-ink-muted">Status</dt>
                <dd className="flex items-center gap-2">
                  <span aria-hidden="true" className="size-2 rounded-full bg-success" />
                  {order.status === "paid" ? "Paid" : "Cancelled"}
                </dd>
              </div>
            </dl>
          </div>
          <div className="border-t pt-6">
            <h2 className="type-label text-ink-muted">Shipping to</h2>
            <address className="mt-4 type-body not-italic">
              {addressLines.map((line) => (
                <span key={line} className="block break-words">
                  {line}
                </span>
              ))}
            </address>
          </div>
          <div className="border-t pt-6">
            <h2 className="type-label text-ink-muted">Payment</h2>
            <p className="mt-4 type-body">
              Card ending {order.payment.last4 ?? "····"}
              <span className="mt-1 block type-caption text-ink-muted">Demo payment, no charge made</span>
            </p>
          </div>
        </aside>
      </div>

      <div className="container-content mt-12 flex flex-col gap-3 sm:flex-row">
        <Link href="/collections/new-in" className="btn btn-primary">
          Continue shopping
        </Link>
        <Link href="/account" className="btn btn-secondary">
          View my account
        </Link>
      </div>
    </>
  );
}

function OrderSkeleton() {
  return (
    <div aria-hidden className="container-content pt-section-sm">
      <div className="mx-auto h-40 max-w-md bg-surface" />
      <div className="mt-10 h-80 bg-surface" />
    </div>
  );
}

export function OrderConfirmationPage({ params }: { params: Promise<{ number: string }> }) {
  return (
    <div className="pb-section">
      <Suspense fallback={<OrderSkeleton />}>
        <OrderContent params={params} />
      </Suspense>
    </div>
  );
}
