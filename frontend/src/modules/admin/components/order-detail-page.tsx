import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { isApiError } from "@/shared/api/errors";
import { formatPrice } from "@/shared/lib/format-price";

import { getOrder } from "../api/admin.service";
import type { AdminOrder } from "../types";
import { OrderStatusForm } from "./order-status-form";
import { AdminPageHeader, dateTimeFormat, OrderStatusBadge, TableSkeleton } from "./ui";

async function loadOrder(number: string): Promise<AdminOrder> {
  try {
    return await getOrder(number);
  } catch (error) {
    if (isApiError(error, 404) || isApiError(error, 400)) notFound();
    throw error;
  }
}

async function OrderContent({ params }: { params: Promise<{ number: string }> }) {
  const { number } = await params;
  const order = await loadOrder(number);
  const address = order.shippingAddress;

  return (
    <>
      <AdminPageHeader
        eyebrow="Order"
        title={order.number}
        description={`Placed ${dateTimeFormat.format(new Date(order.createdAt))} · last updated ${dateTimeFormat.format(new Date(order.updatedAt))}`}
        action={<OrderStatusBadge status={order.status} />}
      />

      <div className="grid gap-10 pt-8 xl:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="flex flex-col gap-10">
          <section aria-labelledby="status-title" className="bg-surface px-6 py-6">
            <h2 id="status-title" className="type-title">
              Update status
            </h2>
            <p className="mt-1 mb-5 type-caption text-ink-muted">
              Orders move paid → processing → shipped → delivered. They can be cancelled until they ship;
              cancelling returns the items to stock.
            </p>
            <OrderStatusForm number={order.number} nextStatuses={order.nextStatuses} />
          </section>

          <section aria-labelledby="items-title">
            <h2 id="items-title" className="border-b pb-3 type-label text-ink-muted">
              {order.itemCount} {order.itemCount === 1 ? "item" : "items"}
            </h2>
            <ul>
              {order.items.map((item) => (
                <li key={item.productSlug} className="grid grid-cols-[4rem_minmax(0,1fr)_auto] items-start gap-4 border-b py-4">
                  <div className="media-frame aspect-product">
                    <Image src={item.image.src} alt="" fill sizes="4rem" style={{ objectPosition: item.image.position }} />
                  </div>
                  <div className="min-w-0">
                    <Link href={`/admin/products/${item.productSlug}`} className="type-body link-quiet">
                      {item.name}
                    </Link>
                    <p className="mt-1 type-caption text-ink-muted">
                      {item.colorName} · {formatPrice(item.unitPrice)} × {item.quantity}
                    </p>
                  </div>
                  <p className="type-body">{formatPrice(item.lineTotal)}</p>
                </li>
              ))}
            </ul>
            <dl className="mt-4 ml-auto flex max-w-xs flex-col gap-2 type-body">
              <div className="flex justify-between gap-4">
                <dt className="text-ink-muted">Subtotal</dt>
                <dd>{formatPrice(order.subtotal)}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-ink-muted">Shipping</dt>
                <dd>{order.shipping.amount > 0 ? formatPrice(order.shipping) : "Complimentary"}</dd>
              </div>
              <div className="flex justify-between gap-4 border-t pt-3">
                <dt className="type-label">Total</dt>
                <dd className="type-title">{formatPrice(order.total)}</dd>
              </div>
            </dl>
          </section>
        </div>

        <aside className="flex flex-col gap-8 self-start border px-6 py-6">
          <div>
            <h2 className="type-label text-ink-muted">Customer</h2>
            <p className="mt-3 type-body">{order.customer?.name ?? "Deleted account"}</p>
            <p className="type-body break-all text-ink-muted">{order.email}</p>
          </div>
          <div className="border-t pt-6">
            <h2 className="type-label text-ink-muted">Ship to</h2>
            <address className="mt-3 type-body not-italic">
              {[address.fullName, address.line1, address.line2, `${address.city} ${address.postalCode}`, address.country, address.phone]
                .filter(Boolean)
                .map((line) => (
                  <span key={line} className="block break-words">
                    {line}
                  </span>
                ))}
            </address>
          </div>
          <div className="border-t pt-6">
            <h2 className="type-label text-ink-muted">Payment</h2>
            <p className="mt-3 type-body">Card ending {order.payment.last4 ?? "····"}</p>
            <p className="type-caption text-ink-muted">Simulated payment</p>
          </div>
        </aside>
      </div>
    </>
  );
}

export function AdminOrderDetailPage({ params }: { params: Promise<{ number: string }> }) {
  return (
    <>
      <Link href="/admin/orders" className="mb-6 inline-block type-label link-muted">
        ← All orders
      </Link>
      <Suspense fallback={<TableSkeleton />}>
        <OrderContent params={params} />
      </Suspense>
    </>
  );
}
