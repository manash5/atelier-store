import type { Product } from "../types";
import { ProductCard } from "./product-card";

type ProductListingProps = {
  products: Product[];
  className?: string;
};

// Full listing pages: 2 → 3 → 4 columns (`grid-products`). For a single
// curated row of four, use ProductGrid instead.
export function ProductListing({ products, className = "" }: ProductListingProps) {
  return (
    <ul className={`grid-products ${className}`}>
      {products.map((product) => (
        <li key={product.slug}>
          <ProductCard
            product={product}
            sizes="(min-width: 1280px) 25vw, (min-width: 768px) 33vw, 50vw"
          />
        </li>
      ))}
    </ul>
  );
}
