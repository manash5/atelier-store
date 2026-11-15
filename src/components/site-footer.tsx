import Link from "next/link";

const columns = [
  {
    title: "Client Services",
    links: [
      { label: "Contact us", href: "/client-services" },
      { label: "Shipping", href: "/client-services/shipping" },
      { label: "Returns & exchanges", href: "/client-services/returns" },
      { label: "FAQs", href: "/client-services/faq" },
    ],
  },
  {
    title: "Visit Us",
    links: [
      { label: "Store locator", href: "/stores" },
      { label: "Book an appointment", href: "/services/appointments" },
      { label: "Personalization", href: "/services/personalization" },
      { label: "Gift cards", href: "/gift-cards" },
    ],
  },
  {
    title: "The House",
    links: [
      { label: "About Atelier", href: "/about" },
      { label: "Craftsmanship", href: "/about/craftsmanship" },
      { label: "Sustainability", href: "/about/sustainability" },
      { label: "Careers", href: "/careers" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy policy", href: "/legal/privacy" },
      { label: "Terms of sale", href: "/legal/terms" },
      { label: "Cookie settings", href: "/legal/cookies" },
      { label: "Accessibility", href: "/legal/accessibility" },
    ],
  },
] as const;

export function SiteFooter() {
  return (
    <footer className="border-t">
      <div className="container-page grid grid-cols-2 gap-x-6 gap-y-10 py-section-sm lg:grid-cols-4">
        {columns.map((column) => (
          <nav key={column.title} aria-label={column.title}>
            <h2 className="type-label">{column.title}</h2>
            <ul className="mt-5 flex flex-col gap-3">
              {column.links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="type-body link-muted">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      <div className="container-page overflow-hidden" aria-hidden="true">
        <p className="-mr-[0.08em] text-center font-display text-[15.5vw] leading-[0.82] tracking-[0.08em] select-none min-[90rem]:text-[13.5rem]">
          ATELIER
        </p>
      </div>

      <div className="container-page mt-8 flex flex-col gap-2 border-t py-6 type-caption text-ink-muted md:flex-row md:justify-between">
        <p>© 2026 Atelier. All rights reserved.</p>
        <p>United States · USD $ · English</p>
      </div>
    </footer>
  );
}
