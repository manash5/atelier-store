import { ProductGrid } from "@/components/product-grid";
import { SectionHeading } from "@/components/section-heading";
import { giftEdit } from "@/lib/catalog";

export function GiftEdit() {
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
