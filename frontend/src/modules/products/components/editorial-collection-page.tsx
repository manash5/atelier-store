import Image from "next/image";
import Link from "next/link";

import { getProductsBySlugs } from "../api/products.service";
import { type EditorialEditKey, editorialEdits } from "../content";
import { ProductListing } from "./product-listing";

/**
 * An editorial edit: a campaign banner (the same photography as the homepage
 * link that leads here) above its curated products, in display order.
 */
export async function EditorialCollectionPage({ edit: key }: { edit: EditorialEditKey }) {
  const edit = editorialEdits[key];
  const products = await getProductsBySlugs(edit.slugs);
  const count = `${products.length} ${products.length === 1 ? "piece" : "pieces"}`;

  return (
    <section aria-labelledby="edit-title" className="pb-section">
      <header className="relative text-canvas">
        <div className="media-frame aspect-portrait sm:aspect-landscape lg:aspect-[21/9]">
          <Image
            src={edit.image.src}
            alt={edit.image.alt}
            fill
            loading="eager"
            fetchPriority="high"
            sizes="100vw"
            style={{ objectPosition: edit.image.position }}
          />
        </div>
        <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-ink/65 via-ink/25 to-transparent pt-40 pb-10 lg:pb-14">
          <div className="container-page flex flex-col items-center text-center">
            <p className="type-label">{edit.eyebrow}</p>
            <h1 id="edit-title" className="mt-4 type-display">
              {edit.title}
            </h1>
            <p className="mt-5 max-w-xl type-body-lg">{edit.description}</p>
          </div>
        </div>
      </header>

      <div className="container-page pt-8 lg:pt-12">
        {products.length > 0 ? (
          <>
            <p className="border-t py-4 type-label text-ink-muted">{count}</p>
            <ProductListing products={products} className="mt-2 md:mt-4" />
          </>
        ) : (
          <div className="flex flex-col items-center border-t py-section-sm text-center">
            <p className="type-body-lg text-ink-muted">
              This edit is being restocked. Please check back soon.
            </p>
            <Link href="/collections/new-in" className="mt-8 btn btn-primary">
              Shop new arrivals
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
