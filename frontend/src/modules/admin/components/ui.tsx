import Link from "next/link";
import type { ReactNode } from "react";

import type { PaginationMeta } from "@/shared/types/api";

import type { OrderStatus, StockStatus } from "../types";

export function AdminPageHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <header className="flex flex-col gap-4 border-b pb-6 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow ? <p className="type-label text-ink-muted">{eyebrow}</p> : null}
        <h1 className="mt-2 type-heading">{title}</h1>
        {description ? <p className="mt-2 max-w-2xl type-body text-ink-muted">{description}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </header>
  );
}

const ORDER_TONE: Record<OrderStatus, string> = {
  paid: "bg-ink-subtle",
  processing: "bg-sale",
  shipped: "bg-ink",
  delivered: "bg-success",
  cancelled: "bg-line-strong",
};

export const ORDER_LABEL: Record<OrderStatus, string> = {
  paid: "Paid",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span className="inline-flex items-center gap-2 type-body">
      <span aria-hidden="true" className={`size-2 shrink-0 rounded-full ${ORDER_TONE[status]}`} />
      {ORDER_LABEL[status]}
    </span>
  );
}

export function StockBadge({ stock, status }: { stock: number; status: StockStatus }) {
  const tone = status === "sold-out" ? "bg-ink-subtle" : status === "low-stock" ? "bg-sale" : "bg-success";
  return (
    <span className="inline-flex items-center gap-2 type-body">
      <span aria-hidden="true" className={`size-2 shrink-0 rounded-full ${tone}`} />
      {status === "sold-out" ? "Sold out" : `${stock} in stock`}
    </span>
  );
}

export function FormMessage({ status, message }: { status?: "saved" | "error"; message?: string }) {
  if (!message) return null;
  return status === "saved" ? (
    <p role="status" className="flex items-center gap-2.5 border px-4 py-3 type-body">
      <span aria-hidden="true" className="size-2 shrink-0 rounded-full bg-success" />
      {message}
    </p>
  ) : (
    <p role="alert" className="border border-sale px-4 py-3 type-body text-sale">
      {message}
    </p>
  );
}

export function Field({
  id,
  label,
  error,
  hint,
  children,
  className,
}: {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex flex-col gap-2 ${className ?? ""}`}>
      <label htmlFor={id} className="type-label">
        {label}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} className="type-caption text-sale">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="type-caption text-ink-muted">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

export function EmptyState({ children }: { children: ReactNode }) {
  return <p className="border-b py-12 text-center type-body text-ink-muted">{children}</p>;
}

/** Previous/next links that keep the current filters. */
export function Pagination({
  meta,
  basePath,
  params,
}: {
  meta: PaginationMeta;
  basePath: string;
  params: Record<string, string | undefined>;
}) {
  const pages = Math.max(1, Math.ceil(meta.total / meta.limit));
  if (pages <= 1) return null;
  const href = (page: number) => {
    const search = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) if (value) search.set(key, value);
    if (page > 1) search.set("page", String(page));
    const query = search.toString();
    return query ? `${basePath}?${query}` : basePath;
  };
  return (
    <nav aria-label="Pagination" className="flex items-center justify-between gap-4 pt-6">
      <p className="type-caption text-ink-muted">
        Page {meta.page} of {pages} · {meta.total} total
      </p>
      <div className="flex gap-2">
        {meta.page > 1 ? (
          <Link href={href(meta.page - 1)} className="btn btn-secondary btn-sm">
            Previous
          </Link>
        ) : null}
        {meta.page < pages ? (
          <Link href={href(meta.page + 1)} className="btn btn-secondary btn-sm">
            Next
          </Link>
        ) : null}
      </div>
    </nav>
  );
}

/** A GET form for list filters (works without JavaScript). */
export function FilterBar({ action, children }: { action: string; children: ReactNode }) {
  return (
    <form action={action} className="flex flex-col gap-3 py-6 sm:flex-row sm:items-end">
      {children}
      <div className="flex gap-2">
        <button type="submit" className="btn btn-primary">
          Apply
        </button>
        <Link href={action} className="btn btn-ghost">
          Reset
        </Link>
      </div>
    </form>
  );
}

export const dateFormat = new Intl.DateTimeFormat("en-US", { dateStyle: "medium" });
export const dateTimeFormat = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeStyle: "short",
});

export function TableSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div aria-hidden className="mt-6 flex flex-col gap-px">
      {Array.from({ length: rows }, (_, index) => (
        <div key={index} className="h-14 bg-surface" />
      ))}
    </div>
  );
}
