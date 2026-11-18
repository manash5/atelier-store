import { getProductsBySlugs } from "../api/products.service";
import { giftSlugs } from "../content";
import { ProductListingPage } from "./product-listing-page";

/** The Gift Edit: a curated selection, in display order. */
export async function GiftsPage() {
  const products = await getProductsBySlugs(giftSlugs);

  return (
    <ProductListingPage
      eyebrow="The Gift Edit"
      title="Gifts"
      description="Considered pieces chosen for giving, from fine jewelry to leather goods."
      products={products}
    />
  );
}
