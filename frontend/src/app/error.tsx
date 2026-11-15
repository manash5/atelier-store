"use client";

import Link from "next/link";

// Shown when a page fails to render, e.g. the catalog API is unavailable.
export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <section className="container-prose flex flex-col items-center py-section text-center">
      <p className="type-label text-ink-muted">Something went wrong</p>
      <h1 className="mt-4 type-display">We couldn&rsquo;t load this page</h1>
      <p className="mt-5 type-body-lg text-ink-muted">
        Please try again in a moment.
      </p>
      <div className="mt-10 flex flex-col gap-3 sm:flex-row">
        <button type="button" onClick={reset} className="btn btn-primary">
          Try again
        </button>
        <Link href="/" className="btn btn-secondary">
          Return home
        </Link>
      </div>
    </section>
  );
}
