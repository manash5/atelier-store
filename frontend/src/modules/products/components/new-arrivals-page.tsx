import { getNewArrivals } from "../api/products.service";
import { ProductListingPage } from "./product-listing-page";

/** "New In": the latest additions to the catalog, newest first. */
export async function NewArrivalsPage() {
  const products = await getNewArrivals();

  return (
    <ProductListingPage
      eyebrow="Just in"
      title="New Arrivals"
      description="The latest pieces to arrive at the house, from ready-to-wear to jewelry, shoes and leather goods."
      products={products}
    />
  );
}
