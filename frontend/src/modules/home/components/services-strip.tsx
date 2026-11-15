import { services } from "../content";

export function ServicesStrip() {
  return (
    <section aria-label="Services">
      <ul className="container-page grid gap-8 py-section-sm sm:grid-cols-2 lg:grid-cols-4 lg:gap-10">
        {services.map((service) => (
          <li key={service.title}>
            <h3 className="type-label">{service.title}</h3>
            <p className="mt-2 type-body text-ink-muted">{service.body}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
