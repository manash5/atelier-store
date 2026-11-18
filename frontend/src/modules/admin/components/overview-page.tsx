import Link from "next/link";
import { Suspense } from "react";

import { formatPrice } from "@/shared/lib/format-price";

import { getOverview } from "../api/admin.service";
import type { OrderStatus } from "../types";
import { AdminPageHeader, dateFormat, OrderStatusBadge, ORDER_LABEL, StockBadge, TableSkeleton } from "./ui";

const PIPELINE: OrderStatus[] = ["paid", "processing", "shipped", "delivered", "cancelled"];

async function OverviewContent() {
  const overview = await getOverview();
  const open = overview.orders.byStatus.paid + overview.orders.byStatus.processing;

  const stats = [
    { label: "Revenue", value: formatPrice(overview.orders.revenue), note: "Excludes cancelled orders" },
    { label: "To fulfil", value: String(open), note: "Paid or processing", href: "/admin/orders?status=paid" },
    {
      label: "Appointments",
      value: String(overview.newAppointments),
      note: "New requests",
      href: "/admin/appointments?status=new",
    },
    { label: "Products", value: String(overview.productCount), href: "/admin/products" },
    { label: "Admins", value: String(overview.adminCount), href: "/admin/admins" },
  ];

  return (
    <div className="flex flex-col gap-12 pt-8">
      <ul className="grid grid-cols-2 gap-2 lg:grid-cols-5">
        {stats.map((stat) => (
          <li key={stat.label} className="bg-surface px-5 py-6 last:col-span-2 lg:last:col-span-1">
            <p className="type-label text-ink-muted">{stat.label}</p>
            <p className="mt-3 type-heading">{stat.value}</p>
            {stat.href ? (
              <Link href={stat.href} className="mt-2 inline-block type-caption link-muted">
                {stat.note ?? "View"}
              </Link>
            ) : (
              <p className="mt-2 type-caption text-ink-muted">{stat.note}</p>
            )}
          </li>
        ))}
      </ul>

      <section aria-labelledby="pipeline-title">
        <h2 id="pipeline-title" className="type-title">
          Orders by status
        </h2>
        <ul className="mt-4 grid grid-cols-2 border-t sm:grid-cols-5">
          {PIPELINE.map((status) => (
            <li key={status} className="border-b py-4 sm:border-r sm:px-4 sm:first:pl-0 sm:last:border-r-0">
              <Link href={`/admin/orders?status=${status}`} className="group block">
                <OrderStatusBadge status={status} />
                <p className="mt-2 type-heading group-hover:underline group-hover:underline-offset-4">
                  {overview.orders.byStatus[status]}
                </p>
                <span className="sr-only">{ORDER_LABEL[status]} orders</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <div className="grid gap-12 xl:grid-cols-2">
        <section aria-labelledby="recent-title">
          <div className="flex items-baseline justify-between gap-4">
            <h2 id="recent-title" className="type-title">
              Recent orders
            </h2>
            <Link href="/admin/orders" className="type-label link">
              All orders
            </Link>
          </div>
          {overview.recentOrders.length === 0 ? (
            <p className="mt-4 border-t py-8 type-body text-ink-muted">No orders yet.</p>
          ) : (
            <ul className="mt-4 border-t">
              {overview.recentOrders.map((order) => (
                <li key={order.number} className="border-b">
                  <Link
                    href={`/admin/orders/${order.number}`}
                    className="group grid grid-cols-[minmax(0,1fr)_auto] gap-x-4 gap-y-1 py-4"
                  >
                    <span className="type-body group-hover:underline group-hover:underline-offset-4">
                      {order.number}
                    </span>
                    <span className="text-right type-body">{formatPrice(order.total)}</span>
                    <span className="truncate type-caption text-ink-muted">
                      {order.customer?.name ?? order.shippingAddress.fullName} · {dateFormat.format(new Date(order.createdAt))}
                    </span>
                    <span className="text-right">
                      <OrderStatusBadge status={order.status} />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section aria-labelledby="low-stock-title">
          <div className="flex items-baseline justify-between gap-4">
            <h2 id="low-stock-title" className="type-title">
              Low stock
            </h2>
            <Link href="/admin/products?stock=low" className="type-label link">
              Review stock
            </Link>
          </div>
          {overview.lowStock.length === 0 ? (
            <p className="mt-4 border-t py-8 type-body text-ink-muted">Every product is well stocked.</p>
          ) : (
            <ul className="mt-4 border-t">
              {overview.lowStock.map((product) => (
                <li key={product.slug} className="border-b">
                  <Link
                    href={`/admin/products/${product.slug}`}
                    className="group flex items-center justify-between gap-4 py-4"
                  >
                    <span className="min-w-0 truncate type-body group-hover:underline group-hover:underline-offset-4">
                      {product.name}
                    </span>
                    <StockBadge stock={product.stock} status={product.stockStatus} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}

export function AdminOverviewPage() {
  return (
    <>
      <AdminPageHeader eyebrow="Admin" title="Overview" description="Orders, stock and access at a glance." />
      <Suspense fallback={<TableSkeleton rows={8} />}>
        <OverviewContent />
      </Suspense>
    </>
  );
}
