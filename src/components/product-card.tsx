import Image from "next/image";
import Link from "next/link";

import { formatPrice, getStockStatus, type Product } from "@/lib/catalog";

type ProductCardProps = {
  product: Product;
  /** `sizes` for the image; depends on the grid or rail the card sits in. */
  sizes: string;
};

export function ProductCard({ product, sizes }: ProductCardProps) {
  const [image] = product.images;
  const soldOut = getStockStatus(product) === "sold-out";
  const label = soldOut ? "Sold out" : product.badge;

  return (
    <Link href={`/products/${product.slug}`} className="group block">
      <div className="media-frame aspect-product">
        <Image
          src={image.src}
          alt={image.alt}
          fill
          sizes={sizes}
          style={{ objectPosition: image.position }}
          className="transition-transform duration-700 ease-standard group-hover:scale-[1.03]"
        />
      </div>

      <div className="mt-3 flex flex-col gap-0.5 pr-2 md:mt-4">
        {label ? (
          <p className="mb-1 type-micro text-ink-muted">{label}</p>
        ) : null}
        <h3 className="type-body group-hover:underline group-hover:underline-offset-4">
          {product.name}
        </h3>
        <p className="type-body text-ink-muted">
          {formatPrice(product.price, product.currency)}
        </p>
      </div>
    </Link>
  );
}
