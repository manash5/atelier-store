import { getProductsByGender } from "../api/products.service";
import type { ShopGender } from "../types";
import { ProductListingPage } from "./product-listing-page";

const titles: Record<ShopGender, string> = { women: "Women", men: "Men" };

/** The Women or Men edit: every category, including unisex pieces. */
export async function GenderCollectionPage({ gender }: { gender: ShopGender }) {
  const products = await getProductsByGender(gender);

  return (
    <ProductListingPage eyebrow="Collection" title={titles[gender]} products={products} />
  );
}
