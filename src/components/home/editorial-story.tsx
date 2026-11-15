import Image from "next/image";
import Link from "next/link";

import { editorialStory } from "@/lib/catalog";

// Image and copy split 50/50 from tablet up, stacked on phones.
export function EditorialStory() {
  return (
    <section
      aria-labelledby="editorial-title"
      className="grid bg-surface md:grid-cols-2"
    >
      <div className="media-frame aspect-portrait md:aspect-auto md:min-h-[36rem] lg:min-h-[48rem]">
        <Image
          src={editorialStory.image.src}
          alt={editorialStory.image.alt}
          fill
          sizes="(min-width: 768px) 50vw, 100vw"
          style={{ objectPosition: editorialStory.image.position }}
        />
      </div>

      <div className="flex items-center px-gutter py-section-sm md:px-10 lg:px-16 xl:px-24">
        <div className="max-w-md">
          <p className="type-label text-ink-muted">{editorialStory.eyebrow}</p>
          <h2 id="editorial-title" className="mt-4 type-display">
            {editorialStory.title}
          </h2>
          <p className="mt-6 type-body-lg text-ink-muted">{editorialStory.body}</p>
          <Link href={editorialStory.href} className="mt-10 btn btn-secondary">
            {editorialStory.cta}
          </Link>
        </div>
      </div>
    </section>
  );
}
