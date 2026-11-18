import Link from "next/link";
import { Suspense } from "react";

import { formatPrice } from "@/shared/lib/format-price";

import { listOrders } from "../api/admin.service";
import type { OrderStatus } from "../types";
import {
  AdminPageHeader,
  dateFormat,
  EmptyState,
  FilterBar,
  ORDER_LABEL,
  OrderStatusBadge,
  Pagination,
  TableSkeleton,
} from "./ui";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const STATUSES = Object.keys(ORDER_LABEL) as OrderStatus[];
const one = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value);

async function OrdersContent({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const q = one(params.q)?.trim() || undefined;
  const status = STATUSES.includes(one(params.status) as OrderStatus) ? one(params.status) : undefined;
  const page = Math.max(1, Number(one(params.page)) || 1);
  const { items, meta } = await listOrders({ page, q, status });

  return (
    <>
      <FilterBar action="/admin/orders">
        <div className="flex flex-1 flex-col gap-2">
          <label htmlFor="orders-q" className="type-label">
            Search
          </label>
          <input id="orders-q" name="q" defaultValue={q} placeholder="Order number or email" className="input-base" />
        </div>
        <div className="flex flex-col gap-2 sm:w-48">
          <label htmlFor="orders-status" className="type-label">
            Status
          </label>
          <select id="orders-status" name="status" defaultValue={status ?? ""} className="input-base">
            <option value="">All statuses</option>
            {STATUSES.map((value) => (
              <option key={value} value={value}>
                {ORDER_LABEL[value]}
              </option>
            ))}
          </select>
        </div>
      </FilterBar>

      {items.length === 0 ? (
        <EmptyState>No orders match these filters.</EmptyState>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[40rem] border-t text-left">
            <thead>
              <tr className="border-b">
                <th scope="col" className="py-3 pr-4 type-label text-ink-muted">Order</th>
                <th scope="col" className="py-3 pr-4 type-label text-ink-muted">Customer</th>
                <th scope="col" className="py-3 pr-4 type-label text-ink-muted">Placed</th>
                <th scope="col" className="py-3 pr-4 type-label text-ink-muted">Status</th>
                <th scope="col" className="py-3 text-right type-label text-ink-muted">Total</th>
              </tr>
            </thead>
            <tbody>
              {items.map((order) => (
                <tr key={order.number} className="border-b align-top">
                  <td className="py-4 pr-4 type-body">
                    <Link href={`/admin/orders/${order.number}`} className="link">
                      {order.number}
                    </Link>
                    <span className="block type-caption text-ink-muted">
                      {order.itemCount} {order.itemCount === 1 ? "item" : "items"}
                    </span>
                  </td>
                  <td className="max-w-56 py-4 pr-4 type-body">
                    <span className="block truncate">{order.customer?.name ?? order.shippingAddress.fullName}</span>
                    <span className="block truncate type-caption text-ink-muted">{order.email}</span>
                  </td>
                  <td className="py-4 pr-4 type-body text-ink-muted">{dateFormat.format(new Date(order.createdAt))}</td>
                  <td className="py-4 pr-4">
                    <OrderStatusBadge status={order.status} />
                  </td>
                  <td className="py-4 text-right type-body">{formatPrice(order.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Pagination meta={meta} basePath="/admin/orders" params={{ q, status }} />
    </>
  );
}

export function AdminOrdersPage({ searchParams }: { searchParams: SearchParams }) {
  return (
    <>
      <AdminPageHeader eyebrow="Admin" title="Orders" description="Every order across all customers, newest first." />
      <Suspense fallback={<TableSkeleton />}>
        <OrdersContent searchParams={searchParams} />
      </Suspense>
    </>
  );
}
