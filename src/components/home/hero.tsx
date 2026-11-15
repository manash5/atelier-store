import Image from "next/image";
import Link from "next/link";

import { heroCampaign } from "@/lib/catalog";

// Campaign diptych: one portrait image on small screens, two side by side
// from lg up. Copy sits on a bottom scrim, centered across both images.
export function Hero() {
  const [primary, secondary] = heroCampaign.images;

  return (
    <section
      aria-labelledby="hero-title"
      className="relative h-hero overflow-hidden bg-surface text-canvas"
    >
      <div className="grid h-full lg:grid-cols-2">
        <div className="relative">
          <Image
            src={primary.src}
            alt={primary.alt}
            fill
            loading="eager"
            fetchPriority="high"
            sizes="(min-width: 1024px) 50vw, 100vw"
            style={{ objectPosition: primary.position }}
            className="object-cover"
          />
        </div>
        {/* Lazy so it is never fetched while hidden on small screens. */}
        <div className="relative hidden lg:block">
          <Image
            src={secondary.src}
            alt={secondary.alt}
            fill
            sizes="50vw"
            style={{ objectPosition: secondary.position }}
            className="object-cover"
          />
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-ink/65 via-ink/25 to-transparent pt-48 pb-12 lg:pb-16">
        <div className="container-page flex flex-col items-center text-center">
          <p className="type-label">{heroCampaign.eyebrow}</p>
          <h1 id="hero-title" className="mt-4 type-display-xl">
            {heroCampaign.title}
          </h1>
          <p className="mt-5 max-w-md type-body-lg">
            {heroCampaign.description}
          </p>
          <Link href={heroCampaign.href} className="mt-8 btn btn-inverse">
            Discover the collection
          </Link>
        </div>
      </div>
    </section>
  );
}
