import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { Disclosure } from "@/components/product/disclosure";
import { ProductGallery } from "@/components/product/product-gallery";
import { StockStatus } from "@/components/product/stock-status";
import { ProductGrid } from "@/components/product-grid";
import { SectionHeading } from "@/components/section-heading";
import {
  categoryTitles,
  formatPrice,
  getProduct,
  getRelatedProducts,
  getStockStatus,
  products,
  type StockStatus as Status,
} from "@/lib/catalog";

// Cache Components requires at least one param; every sample product is
// prerendered. Unknown slugs render on request and hit notFound().
export function generateStaticParams() {
  return products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/products/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) notFound();

  const [image] = product.images;
  return {
    title: product.name,
    description: product.description,
    openGraph: {
      title: product.name,
      description: product.description,
      images: [{ url: image.src, alt: image.alt }],
    },
  };
}

const schemaAvailability: Record<Status, string> = {
  "in-stock": "https://schema.org/InStock",
  "low-stock": "https://schema.org/LimitedAvailability",
  "sold-out": "https://schema.org/OutOfStock",
};

// The shell renders immediately on navigation; everything that reads the
// slug streams in behind a skeleton shaped like the final layout.
// Prerendered slugs still ship complete HTML on a direct page load.
export default function ProductPage({ params }: PageProps<"/products/[slug]">) {
  return (
    <Suspense fallback={<ProductPageSkeleton />}>
      <ProductDetails params={params} />
    </Suspense>
  );
}

async function ProductDetails({
  params,
}: {
  params: PageProps<"/products/[slug]">["params"];
}) {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) notFound();

  const status = getStockStatus(product);
  const categoryTitle = categoryTitles[product.category];
  const categoryHref = `/collections/${product.category}`;
  const related = getRelatedProducts(product);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    sku: product.styleNumber,
    category: categoryTitle,
    color: product.color.name,
    image: product.images.map((image) => image.src),
    brand: { "@type": "Brand", name: "Atelier" },
    offers: {
      "@type": "Offer",
      price: product.price,
      priceCurrency: product.currency,
      availability: schemaAvailability[status],
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />

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
            <p className="mt-4 type-title">
              {formatPrice(product.price, product.currency)}
            </p>
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

            {/* The cart isn't built yet: this is the slot for it. */}
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
                <button type="button" className="btn btn-primary w-full">
                  Add to bag
                </button>
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

function ProductPageSkeleton() {
  return (
    <div
      aria-busy="true"
      aria-label="Loading product"
      className="mx-auto max-w-page md:grid md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)]"
    >
      <div className="aspect-product animate-pulse bg-surface" />
      <div className="px-gutter pt-6 md:pt-10 md:pl-8 lg:px-12 lg:pt-12 xl:px-20">
        <div className="flex max-w-md animate-pulse flex-col gap-4">
          <div className="h-3 w-28 bg-surface-strong" />
          <div className="h-9 w-4/5 bg-surface-strong" />
          <div className="h-5 w-20 bg-surface-strong" />
          <div className="mt-8 h-12 w-full bg-surface-strong" />
        </div>
      </div>
    </div>
  );
}
