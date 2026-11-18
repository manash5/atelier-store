import Link from "next/link";
import type { ReactNode } from "react";

import { formatPrice } from "@/shared/lib/format-price";
import { Disclosure } from "@/shared/ui/disclosure";
import { SectionHeading } from "@/shared/ui/section-heading";

import { getRelatedProducts } from "../api/products.service";
import type { Product } from "../types";
import { ProductGallery } from "./product-gallery";
import { ProductGrid } from "./product-grid";
import { ProductJsonLd } from "./product-json-ld";
import { StockStatus } from "./stock-status";

type ProductDetailProps = {
  product: Product;
  /**
   * Purchase control for in-stock products (the cart's "Add to bag"),
   * passed in by the route because feature modules don't import each other.
   */
  addToBag?: ReactNode;
};

/** The full product page body: gallery, buy box, details and related products. */
export async function ProductDetail({ product, addToBag }: ProductDetailProps) {
  const status = product.stockStatus;
  const categoryTitle = product.category.title;
  const categoryHref = `/collections/${product.category.slug}`;
  const related = await getRelatedProducts(product.slug);

  return (
    <>
      <ProductJsonLd product={product} />

      <article className="mx-auto max-w-page md:grid md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)]">
        <ProductGallery images={product.images} productName={product.name} />

        <div className="px-gutter pt-6 pb-section-sm md:pt-10 md:pl-8 lg:sticky lg:top-header lg:self-start lg:px-12 lg:pt-12 xl:px-20">
          <div className="max-w-md">
            <p className="flex items-center gap-3">
              <Link href={categoryHref} className="type-label text-ink-muted link-quiet">
                {categoryTitle}
              </Link>
              {product.badge ? (
                <span className="border px-2 py-0.5 type-micro">{product.badge}</span>
              ) : null}
            </p>

            <h1 className="mt-3 type-heading">{product.name}</h1>
            <p className="mt-4 type-title">{formatPrice(product.price)}</p>
            <p className="mt-1 type-caption text-ink-muted">
              Style {product.styleNumber}
            </p>

            <div className="mt-8 flex flex-col gap-5 border-t pt-6">
              <p className="flex items-center gap-2.5 type-body">
                <span className="w-14 type-label text-ink-muted">Color</span>
                <span
                  aria-hidden="true"
                  className="size-4 shrink-0 rounded-full border border-line-strong"
                  style={{ backgroundColor: product.color.hex }}
                />
                {product.color.name}
              </p>
              <StockStatus product={product} />
            </div>

            <div className="mt-8 flex flex-col gap-3">
              {status === "sold-out" ? (
                <>
                  <button type="button" className="btn btn-primary w-full" disabled>
                    Sold out
                  </button>
                  <Link href="/client-services" className="btn btn-secondary w-full">
                    Contact a client advisor
                  </Link>
                </>
              ) : (
                addToBag
              )}
            </div>

            <p className="mt-10 type-body-lg text-ink-muted">{product.description}</p>

            <div className="mt-10 border-b">
              <Disclosure title="Details & care" defaultOpen>
                <ul className="flex list-disc flex-col gap-1.5 pl-4">
                  {product.details.map((detail) => (
                    <li key={detail}>{detail}</li>
                  ))}
                </ul>
              </Disclosure>
              <Disclosure title="Shipping & returns">
                <p>
                  Complimentary express shipping on every order, delivered in
                  signature packaging. Return or exchange within 30 days; we
                  collect from your door.
                </p>
              </Disclosure>
              <Disclosure title="Gifting & personalization">
                <p>
                  Every order can be gift wrapped with a handwritten card.
                  Selected leather goods can be hot-stamped with up to three
                  initials.
                </p>
              </Disclosure>
            </div>

            <p className="mt-8 type-body text-ink-muted">
              Questions about fit or materials?{" "}
              <Link href="/services/appointments" className="text-ink link">
                Book an appointment
              </Link>
            </p>
          </div>
        </div>
      </article>

      <section aria-labelledby="related-title" className="container-page py-section">
        <SectionHeading
          id="related-title"
          eyebrow="Complete the look"
          title="You May Also Like"
          action={{ label: `Shop ${categoryTitle}`, href: categoryHref }}
        />
        <ProductGrid products={related} className="mt-8 lg:mt-10" />
      </section>
    </>
  );
}
