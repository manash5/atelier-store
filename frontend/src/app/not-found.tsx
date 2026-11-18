import Link from "next/link";
import { Suspense } from "react";

import { BagCount } from "@/modules/cart";
import { SiteFooter } from "@/shared/layout/site-footer";
import { SiteHeader } from "@/shared/layout/site-header";

// Unknown URLs render outside the (shop) layout, so this page brings the
// storefront chrome itself.
export default function NotFound() {
  return (
    <>
      <SiteHeader
        bagCount={
          <Suspense fallback={null}>
            <BagCount />
          </Suspense>
        }
      />
      <main id="main" className="flex-1">
        <NotFoundContent />
      </main>
      <SiteFooter />
    </>
  );
}

function NotFoundContent() {
  return (
    <section className="container-prose flex flex-col items-center py-section text-center">
      <p className="type-label text-ink-muted">Error 404</p>
      <h1 className="mt-4 type-display">Page not found</h1>
      <p className="mt-5 type-body-lg text-ink-muted">
        The page you are looking for may have moved or is no longer available.
      </p>
      <div className="mt-10 flex flex-col gap-3 sm:flex-row">
        <Link href="/" className="btn btn-primary">
          Return home
        </Link>
        <Link href="/collections/new-in" className="btn btn-secondary">
          Shop new arrivals
        </Link>
      </div>
    </section>
  );
}
