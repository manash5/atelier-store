import Image from "next/image";
import Link from "next/link";

import { SectionHeading } from "@/shared/ui/section-heading";

import { getCategories } from "../api/categories.service";

export async function CategoryGrid() {
  // Only categories with a tile image are shown.
  const categories = (await getCategories()).flatMap((category) =>
    category.image ? [{ ...category, image: category.image }] : [],
  );

  return (
    <section aria-labelledby="categories-title" className="container-page py-section">
      <SectionHeading id="categories-title" eyebrow="Explore" title="Shop by Category" />

      <ul className="mt-8 grid grid-cols-2 gap-x-1 gap-y-8 md:gap-x-2 lg:mt-10 lg:grid-cols-4">
        {categories.map((category) => (
          <li key={category.slug}>
            <Link href={`/collections/${category.slug}`} className="group block">
              <div className="media-frame aspect-portrait">
                <Image
                  src={category.image.src}
                  alt={category.image.alt}
                  fill
                  sizes="(min-width: 1024px) 25vw, 50vw"
                  style={{ objectPosition: category.image.position }}
                  className="transition-transform duration-700 ease-standard group-hover:scale-[1.03]"
                />
              </div>
              <p className="mt-4 text-center type-label">
                <span className="link-quiet group-hover:decoration-current">
                  {category.title}
                </span>
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
