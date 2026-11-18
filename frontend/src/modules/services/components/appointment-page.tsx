import { decodeJwt } from "jose";
import Image from "next/image";
import { connection } from "next/server";
import { Suspense } from "react";

import { getAccessToken } from "@/shared/lib/auth-cookies";

import { appointmentHero, appointmentSteps } from "../content";
import { AppointmentForm } from "./appointment-form";

function isoDay(offsetDays: number): string {
  const day = new Date();
  day.setUTCDate(day.getUTCDate() + offsetDays);
  return day.toISOString().slice(0, 10);
}

/**
 * Request-time part of the form: today's date limits, and the name and email
 * of a signed-in customer (from their verified access token's claims).
 * connection() defers the rest to the request, so reading the clock is safe
 * (getAccessToken() alone returns early for guests, before reaching it).
 */
async function PersonalizedForm() {
  await connection();
  const token = await getAccessToken();
  let prefill: { name?: string; email?: string } | undefined;
  if (token) {
    const claims = decodeJwt(token);
    prefill = {
      name: typeof claims.name === "string" ? claims.name : undefined,
      email: typeof claims.email === "string" ? claims.email : undefined,
    };
  }
  return <AppointmentForm prefill={prefill} minDate={isoDay(0)} maxDate={isoDay(365)} />;
}

export function AppointmentPage() {
  return (
    <>
      <section aria-labelledby="appointment-title" className="grid bg-surface md:grid-cols-2">
        <div className="media-frame aspect-[4/3] md:aspect-auto md:min-h-[28rem] lg:min-h-[32rem]">
          <Image
            src={appointmentHero.image.src}
            alt={appointmentHero.image.alt}
            fill
            loading="eager"
            fetchPriority="high"
            sizes="(min-width: 768px) 50vw, 100vw"
          />
        </div>
        <div className="flex items-center px-gutter py-section-sm md:px-10 lg:px-16 xl:px-24">
          <div className="max-w-md">
            <p className="type-label text-ink-muted">{appointmentHero.eyebrow}</p>
            <h1 id="appointment-title" className="mt-4 type-display">
              {appointmentHero.title}
            </h1>
            <p className="mt-6 type-body-lg text-ink-muted">{appointmentHero.body}</p>
            <a href="#book" className="mt-10 btn btn-primary">
              Book an appointment
            </a>
          </div>
        </div>
      </section>

      <section
        id="book"
        aria-labelledby="book-title"
        className="container-page grid scroll-mt-[calc(var(--spacing-header)+1rem)] gap-12 py-section lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)] lg:gap-20"
      >
        <div>
          <p className="type-label text-ink-muted">How it works</p>
          <h2 id="book-title" className="mt-3 type-heading">
            Request your appointment
          </h2>
          <ol className="mt-8 flex flex-col gap-6 border-t pt-8">
            {appointmentSteps.map((step, index) => (
              <li key={step.title} className="grid grid-cols-[2rem_minmax(0,1fr)] gap-3">
                <span className="type-label text-ink-muted">{String(index + 1).padStart(2, "0")}</span>
                <span>
                  <span className="block type-body">{step.title}</span>
                  <span className="mt-1 block type-body text-ink-muted">{step.body}</span>
                </span>
              </li>
            ))}
          </ol>
          <p className="mt-8 border-t pt-6 type-body text-ink-muted">
            Prefer to talk now? Call <a href="tel:+12125550100" className="link text-ink">+1 212 555 0100</a>,
            Monday to Saturday, 10am to 7pm.
          </p>
        </div>

        <div className="max-w-2xl">
          <Suspense fallback={<AppointmentForm />}>
            <PersonalizedForm />
          </Suspense>
        </div>
      </section>
    </>
  );
}
