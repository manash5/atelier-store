import type { Product } from "../types";
import { ProductCard } from "./product-card";

type ProductGridProps = {
  products: Product[];
  className?: string;
};

// A single row of up to four products: 2×2 on small screens, one row from lg.
// Full listing pages with longer result sets should use `grid-products`.
export function ProductGrid({ products, className = "" }: ProductGridProps) {
  return (
    <ul
      className={`grid grid-cols-2 gap-x-1 gap-y-10 md:gap-x-2 lg:grid-cols-4 ${className}`}
    >
      {products.map((product) => (
        <li key={product.slug}>
          <ProductCard product={product} sizes="(min-width: 1024px) 25vw, 50vw" />
        </li>
      ))}
    </ul>
  );
}
