import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";

import { listCategories } from "../api/admin.service";
import { CategoryForm } from "./category-form";
import { AdminPageHeader, TableSkeleton } from "./ui";

async function CategoriesContent() {
  const categories = await listCategories();

  return (
    <div className="flex flex-col gap-12 pt-8">
      <ul className="flex flex-col border-t">
        {categories.map((category) => (
          <li key={category.slug} className="border-b">
            <details className="group">
              <summary className="flex cursor-pointer list-none items-center gap-4 py-4 [&::-webkit-details-marker]:hidden">
                <span className="media-frame aspect-product w-12 shrink-0 bg-surface">
                  {category.image ? (
                    <Image
                      src={category.image.src}
                      alt=""
                      fill
                      sizes="3rem"
                      style={{ objectPosition: category.image.position }}
                    />
                  ) : null}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block type-body">{category.title}</span>
                  <span className="block type-caption text-ink-muted">
                    /collections/{category.slug} · {category.productCount}{" "}
                    {category.productCount === 1 ? "product" : "products"} · order {category.sortOrder}
                    {category.image ? "" : " · no image (hidden on homepage)"}
                  </span>
                </span>
                <span className="type-label text-ink-muted group-open:hidden">Edit</span>
                <span className="hidden type-label text-ink-muted group-open:inline">Close</span>
              </summary>
              <div className="pb-8">
                <CategoryForm category={category} />
                <Link href={`/admin/products?category=${category.slug}`} className="mt-4 inline-block type-label link-muted">
                  View its products
                </Link>
              </div>
            </details>
          </li>
        ))}
      </ul>

      <section aria-labelledby="new-category-title" className="bg-surface px-6 py-8">
        <h2 id="new-category-title" className="mb-6 type-title">
          New category
        </h2>
        <CategoryForm />
      </section>
    </div>
  );
}

export function AdminCategoriesPage() {
  return (
    <>
      <AdminPageHeader
        eyebrow="Catalog"
        title="Categories"
        description="Shown in the menu, on collection pages and in the homepage grid, in this order."
      />
      <Suspense fallback={<TableSkeleton rows={5} />}>
        <CategoriesContent />
      </Suspense>
    </>
  );
}
