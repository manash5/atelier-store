import Link from "next/link";

import type { Product } from "../types";
import { ProductListing } from "./product-listing";

type ProductListingPageProps = {
  eyebrow: string;
  title: string;
  description?: string;
  products: Product[];
};

/** Full listing page: centered header, item count, then the product grid. */
export function ProductListingPage({
  eyebrow,
  title,
  description,
  products,
}: ProductListingPageProps) {
  const count = `${products.length} ${products.length === 1 ? "piece" : "pieces"}`;

  return (
    <section aria-labelledby="listing-title" className="pb-section">
      <header className="container-page pt-section-sm pb-8 text-center lg:pb-12">
        <p className="type-label text-ink-muted">{eyebrow}</p>
        <h1 id="listing-title" className="mt-4 type-display">
          {title}
        </h1>
        {description ? (
          <p className="mx-auto mt-5 max-w-xl type-body-lg text-ink-muted">
            {description}
          </p>
        ) : null}
      </header>

      <div className="container-page">
        {products.length > 0 ? (
          <>
            <p className="border-t py-4 type-label text-ink-muted">{count}</p>
            <ProductListing products={products} className="mt-2 md:mt-4" />
          </>
        ) : (
          <div className="flex flex-col items-center border-t py-section-sm text-center">
            <p className="type-body-lg text-ink-muted">
              New pieces are on their way. Please check back soon.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/collections/new-in" className="btn btn-primary">
                Shop new arrivals
              </Link>
              <Link href="/" className="btn btn-secondary">
                Return home
              </Link>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
