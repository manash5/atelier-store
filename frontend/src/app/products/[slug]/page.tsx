import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { ProductDetail, ProductPageSkeleton } from "@/modules/products";
import { getAllProductSlugs, getProduct } from "@/modules/products/server";

// Cache Components requires at least one param; every product is prerendered
// from the catalog API at build time (the backend must be reachable). Unknown
// slugs render on request and hit notFound().
export async function generateStaticParams() {
  const slugs = await getAllProductSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/products/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) notFound();

  const [image] = product.images;
  return {
    title: product.name,
    description: product.description,
    openGraph: {
      title: product.name,
      description: product.description,
      images: [{ url: image.src, alt: image.alt }],
    },
  };
}

// The shell renders immediately on navigation; everything that reads the
// slug streams in behind a skeleton shaped like the final layout.
// Prerendered slugs still ship complete HTML on a direct page load.
export default function ProductPage({ params }: PageProps<"/products/[slug]">) {
  return (
    <Suspense fallback={<ProductPageSkeleton />}>
      <ProductRoute params={params} />
    </Suspense>
  );
}

async function ProductRoute({
  params,
}: {
  params: PageProps<"/products/[slug]">["params"];
}) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) notFound();

  return <ProductDetail product={product} />;
}
