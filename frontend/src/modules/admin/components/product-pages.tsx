import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { isApiError } from "@/shared/api/errors";

import { getProduct, listCategories } from "../api/admin.service";
import type { AdminProduct } from "../types";
import { ProductForm } from "./product-form";
import { StockForm } from "./stock-form";
import { AdminPageHeader, dateTimeFormat, StockBadge, TableSkeleton } from "./ui";

async function loadProduct(slug: string): Promise<AdminProduct> {
  try {
    return await getProduct(slug);
  } catch (error) {
    if (isApiError(error, 404) || isApiError(error, 400)) notFound();
    throw error;
  }
}

function BackLink() {
  return (
    <Link href="/admin/products" className="mb-6 inline-block type-label link-muted">
      ← All products
    </Link>
  );
}

async function NewProductContent() {
  const categories = await listCategories();
  return (
    <div className="max-w-3xl pt-8">
      <ProductForm categories={categories} />
    </div>
  );
}

export function AdminNewProductPage() {
  return (
    <>
      <BackLink />
      <AdminPageHeader eyebrow="Catalog" title="New product" description="It goes live in the shop as soon as you create it." />
      <Suspense fallback={<TableSkeleton />}>
        <NewProductContent />
      </Suspense>
    </>
  );
}

async function EditProductContent({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  const [product, categories] = await Promise.all([loadProduct(slug), listCategories()]);

  return (
    <>
      <AdminPageHeader
        eyebrow={product.styleNumber}
        title={product.name}
        description={`Last updated ${dateTimeFormat.format(new Date(product.updatedAt))}`}
        action={
          <Link href={`/products/${product.slug}`} className="btn btn-secondary" target="_blank">
            View in shop
          </Link>
        }
      />
      {query.created ? (
        <p role="status" className="mt-6 flex items-center gap-2.5 border px-4 py-3 type-body">
          <span aria-hidden="true" className="size-2 shrink-0 rounded-full bg-success" />
          Product created and live in the shop.
        </p>
      ) : null}
      <div className="grid gap-10 pt-8 xl:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="order-2 xl:order-1">
          <ProductForm categories={categories} product={product} />
        </div>
        <aside className="order-1 flex flex-col gap-4 self-start bg-surface px-6 py-6 xl:sticky xl:top-[calc(var(--spacing-header)+2rem)] xl:order-2">
          <div className="flex items-center justify-between gap-4">
            <h2 className="type-title">Inventory</h2>
            <StockBadge stock={product.stock} status={product.stockStatus} />
          </div>
          <StockForm slug={product.slug} stock={product.stock} />
        </aside>
      </div>
    </>
  );
}

export function AdminEditProductPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return (
    <>
      <BackLink />
      <Suspense fallback={<TableSkeleton />}>
        <EditProductContent params={params} searchParams={searchParams} />
      </Suspense>
    </>
  );
}
