import { ProductCard } from "@/components/product-card";
import { SectionHeading } from "@/components/section-heading";
import { newArrivals } from "@/lib/catalog";

export function NewArrivals() {
  return (
    <section aria-labelledby="new-arrivals-title" className="py-section">
      <div className="container-page">
        <SectionHeading
          id="new-arrivals-title"
          eyebrow="Just in"
          title="New Arrivals"
          action={{ label: "View all", href: "/collections/new-in" }}
        />
      </div>

      <div className="mx-auto mt-8 max-w-page lg:mt-10">
        <ul className="rail">
          {newArrivals.map((product) => (
            <li key={product.slug}>
              <ProductCard
                product={product}
                sizes="(min-width: 1024px) 25vw, (min-width: 768px) 40vw, 72vw"
              />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
