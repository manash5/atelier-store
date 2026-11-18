"use client";

import Link from "next/link";

// Shown when an admin page fails to render, e.g. the API is unavailable.
export default function AdminError({ reset }: { error: Error; reset: () => void }) {
  return (
    <section className="flex flex-col items-start gap-4 py-section-sm">
      <p className="type-label text-ink-muted">Something went wrong</p>
      <h1 className="type-heading">We couldn&rsquo;t load this page</h1>
      <p className="type-body text-ink-muted">Please try again in a moment.</p>
      <div className="flex gap-3">
        <button type="button" onClick={reset} className="btn btn-primary">
          Try again
        </button>
        <Link href="/admin" className="btn btn-secondary">
          Overview
        </Link>
      </div>
    </section>
  );
}
