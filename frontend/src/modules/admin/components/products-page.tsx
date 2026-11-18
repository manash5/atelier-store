import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";

import { formatPrice } from "@/shared/lib/format-price";

import { listCategories, listProducts } from "../api/admin.service";
import {
  AdminPageHeader,
  EmptyState,
  FilterBar,
  Pagination,
  StockBadge,
  TableSkeleton,
} from "./ui";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;
const one = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value);

async function ProductsContent({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const q = one(params.q)?.trim() || undefined;
  const category = one(params.category) || undefined;
  const stock = ["low", "out"].includes(one(params.stock) ?? "") ? one(params.stock) : undefined;
  const page = Math.max(1, Number(one(params.page)) || 1);
  const [{ items, meta }, categories] = await Promise.all([
    listProducts({ page, q, category, stock }),
    listCategories(),
  ]);

  return (
    <>
      <FilterBar action="/admin/products">
        <div className="flex flex-1 flex-col gap-2">
          <label htmlFor="products-q" className="type-label">
            Search
          </label>
          <input id="products-q" name="q" defaultValue={q} placeholder="Name, slug or style number" className="input-base" />
        </div>
        <div className="flex flex-col gap-2 sm:w-44">
          <label htmlFor="products-category" className="type-label">
            Category
          </label>
          <select id="products-category" name="category" defaultValue={category ?? ""} className="input-base">
            <option value="">All categories</option>
            {categories.map((item) => (
              <option key={item.slug} value={item.slug}>
                {item.title}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-2 sm:w-40">
          <label htmlFor="products-stock" className="type-label">
            Stock
          </label>
          <select id="products-stock" name="stock" defaultValue={stock ?? ""} className="input-base">
            <option value="">Any stock</option>
            <option value="low">Low stock</option>
            <option value="out">Sold out</option>
          </select>
        </div>
      </FilterBar>

      {items.length === 0 ? (
        <EmptyState>No products match these filters.</EmptyState>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[42rem] border-t text-left">
            <thead>
              <tr className="border-b">
                <th scope="col" className="py-3 pr-4 type-label text-ink-muted">Product</th>
                <th scope="col" className="py-3 pr-4 type-label text-ink-muted">Category</th>
                <th scope="col" className="py-3 pr-4 type-label text-ink-muted">Stock</th>
                <th scope="col" className="py-3 text-right type-label text-ink-muted">Price</th>
              </tr>
            </thead>
            <tbody>
              {items.map((product) => (
                <tr key={product.slug} className="border-b">
                  <td className="py-3 pr-4">
                    <Link href={`/admin/products/${product.slug}`} className="group flex items-center gap-4">
                      <span className="media-frame aspect-product w-12 shrink-0">
                        <Image
                          src={product.images[0].src}
                          alt=""
                          fill
                          sizes="3rem"
                          style={{ objectPosition: product.images[0].position }}
                        />
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate type-body group-hover:underline group-hover:underline-offset-4">
                          {product.name}
                        </span>
                        <span className="block type-caption text-ink-muted">{product.styleNumber}</span>
                      </span>
                    </Link>
                  </td>
                  <td className="py-3 pr-4 type-body text-ink-muted">{product.category.title}</td>
                  <td className="py-3 pr-4">
                    <StockBadge stock={product.stock} status={product.stockStatus} />
                  </td>
                  <td className="py-3 text-right type-body">{formatPrice(product.price)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Pagination meta={meta} basePath="/admin/products" params={{ q, category, stock }} />
    </>
  );
}

export function AdminProductsPage({ searchParams }: { searchParams: SearchParams }) {
  return (
    <>
      <AdminPageHeader
        eyebrow="Catalog"
        title="Products"
        description="Edit details, images and stock. Recently updated products come first."
        action={
          <Link href="/admin/products/new" className="btn btn-primary">
            New product
          </Link>
        }
      />
      <Suspense fallback={<TableSkeleton />}>
        <ProductsContent searchParams={searchParams} />
      </Suspense>
    </>
  );
}
