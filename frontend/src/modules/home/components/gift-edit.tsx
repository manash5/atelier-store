import { ProductGrid } from "@/modules/products";
import { getProductsBySlugs } from "@/modules/products/server";
import { SectionHeading } from "@/shared/ui/section-heading";

import { giftEditSlugs } from "../content";

export async function GiftEdit() {
  const giftEdit = await getProductsBySlugs(giftEditSlugs);

  return (
    <section aria-labelledby="gift-edit-title" className="container-page py-section">
      <SectionHeading
        id="gift-edit-title"
        eyebrow="The Gift Edit"
        title="Considered Gifts"
        action={{ label: "Shop gifts", href: "/collections/gifts" }}
      />
      <ProductGrid products={giftEdit} className="mt-8 lg:mt-10" />
    </section>
  );
}
