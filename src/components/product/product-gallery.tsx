"use client";

import Image from "next/image";
import { useRef, useState } from "react";

import type { CatalogImage } from "@/lib/catalog";

type ProductGalleryProps = {
  images: CatalogImage[];
  productName: string;
};

const SIZES =
  "(min-width: 1440px) 852px, (min-width: 1024px) 59vw, (min-width: 768px) 55vw, 100vw";

// Phones: full-width swipe carousel with a position indicator.
// md and up: images stacked vertically beside the product details.
export function ProductGallery({ images, productName }: ProductGalleryProps) {
  const track = useRef<HTMLUListElement>(null);
  const [active, setActive] = useState(0);

  function syncActive() {
    const el = track.current;
    if (el && el.clientWidth > 0) {
      setActive(Math.round(el.scrollLeft / el.clientWidth));
    }
  }

  function showImage(index: number) {
    const el = track.current;
    el?.scrollTo({ left: index * el.clientWidth, behavior: "smooth" });
  }

  return (
    <div>
      <ul
        ref={track}
        onScroll={syncActive}
        aria-label={`${productName} images`}
        className="flex snap-x snap-mandatory overflow-x-auto overscroll-x-contain [scrollbar-width:none] md:flex-col md:gap-0.5 md:overflow-visible"
      >
        {images.map((image, index) => (
          <li
            key={image.src}
            className="media-frame aspect-product w-full shrink-0 snap-start"
          >
            <Image
              src={image.src}
              alt={image.alt}
              fill
              sizes={SIZES}
              loading={index === 0 ? "eager" : undefined}
              fetchPriority={index === 0 ? "high" : undefined}
              style={{ objectPosition: image.position }}
            />
          </li>
        ))}
      </ul>

      {images.length > 1 ? (
        <div className="flex justify-center pt-2 md:hidden">
          {images.map((image, index) => (
            <button
              key={image.src}
              type="button"
              onClick={() => showImage(index)}
              aria-label={`Show image ${index + 1} of ${images.length}`}
              aria-current={index === active ? "true" : undefined}
              className="flex h-8 w-10 items-center justify-center"
            >
              <span
                className={`block h-px w-6 transition-colors ${
                  index === active ? "bg-ink" : "bg-line-strong"
                }`}
              />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
