import type { Product, StockStatus } from "../types";

const schemaAvailability: Record<StockStatus, string> = {
  "in-stock": "https://schema.org/InStock",
  "low-stock": "https://schema.org/LimitedAvailability",
  "sold-out": "https://schema.org/OutOfStock",
};

/** schema.org Product structured data for search engines. */
export function ProductJsonLd({ product }: { product: Product }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    sku: product.styleNumber,
    category: product.category.title,
    color: product.color.name,
    image: product.images.map((image) => image.src),
    brand: { "@type": "Brand", name: "Atelier" },
    offers: {
      "@type": "Offer",
      price: product.price.amount / 100,
      priceCurrency: product.price.currency,
      availability: schemaAvailability[product.stockStatus],
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
      }}
    />
  );
}
