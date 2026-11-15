import Image from "next/image";
import Link from "next/link";

import { featuredCollections } from "../content";

// Full-bleed editorial pair separated by a hairline gap.
export function FeaturedCollections() {
  return (
    <section
      aria-label="Featured collections"
      className="grid gap-0.5 md:grid-cols-2"
    >
      {featuredCollections.map((collection) => (
        <Link
          key={collection.slug}
          href={`/collections/${collection.slug}`}
          className="group media-frame block aspect-portrait text-canvas lg:aspect-product"
        >
          <Image
            src={collection.image.src}
            alt={collection.image.alt}
            fill
            sizes="(min-width: 768px) 50vw, 100vw"
            style={{ objectPosition: collection.image.position }}
            className="transition-transform duration-1000 ease-standard group-hover:scale-[1.02]"
          />
          <div className="absolute inset-x-0 bottom-0 flex flex-col items-center bg-linear-to-t from-ink/60 to-transparent px-gutter pt-40 pb-10 text-center lg:pb-14">
            <p className="type-label">{collection.eyebrow}</p>
            <h2 className="mt-3 type-heading">{collection.title}</h2>
            <p className="mt-3 max-w-xs type-body">{collection.description}</p>
            <span className="mt-6 type-label underline decoration-1 underline-offset-[0.5em]">
              Shop now
            </span>
          </div>
        </Link>
      ))}
    </section>
  );
}
