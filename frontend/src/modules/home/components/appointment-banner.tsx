import Image from "next/image";
import Link from "next/link";

import { appointmentFeature } from "../content";

export function AppointmentBanner() {
  return (
    <section aria-labelledby="appointments-title" className="relative text-canvas">
      <div className="media-frame aspect-portrait md:aspect-landscape lg:aspect-[21/9]">
        <Image
          src={appointmentFeature.image.src}
          alt={appointmentFeature.image.alt}
          fill
          sizes="100vw"
        />
      </div>

      <div className="absolute inset-0 flex items-center justify-center bg-overlay px-gutter text-center">
        <div className="flex max-w-lg flex-col items-center">
          <p className="type-label">{appointmentFeature.eyebrow}</p>
          <h2 id="appointments-title" className="mt-4 type-display">
            {appointmentFeature.title}
          </h2>
          <p className="mt-5 type-body-lg">{appointmentFeature.body}</p>
          <Link href={appointmentFeature.href} className="mt-8 btn btn-inverse">
            {appointmentFeature.cta}
          </Link>
        </div>
      </div>
    </section>
  );
}
