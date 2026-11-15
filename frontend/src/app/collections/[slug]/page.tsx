import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { getCategories, getCategory } from "@/modules/categories/server";
import { ProductListingPage, ProductListingSkeleton } from "@/modules/products";
import { getProductsByCategory } from "@/modules/products/server";

// Every category is prerendered from the catalog API at build time. Unknown
// slugs render on request and hit notFound(). `/collections/new-in` is its
// own static route and takes precedence over this one.
export async function generateStaticParams() {
  const categories = await getCategories();
  return categories.map((category) => ({ slug: category.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/collections/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategory(slug);
  if (!category) notFound();

  const description = `Shop ${category.title.toLowerCase()} at Atelier.`;
  return {
    title: category.title,
    description,
    openGraph: {
      title: category.title,
      description,
      ...(category.image
        ? { images: [{ url: category.image.src, alt: category.image.alt }] }
        : {}),
    },
  };
}

export default function CollectionPage({ params }: PageProps<"/collections/[slug]">) {
  return (
    <Suspense fallback={<ProductListingSkeleton />}>
      <CollectionRoute params={params} />
    </Suspense>
  );
}

async function CollectionRoute({
  params,
}: {
  params: PageProps<"/collections/[slug]">["params"];
}) {
  const { slug } = await params;
  const category = await getCategory(slug);
  if (!category) notFound();

  const products = await getProductsByCategory(category.slug);
  return (
    <ProductListingPage eyebrow="Collection" title={category.title} products={products} />
  );
}
