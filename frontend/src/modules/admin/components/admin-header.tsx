import Link from "next/link";
import type { ReactNode } from "react";

/**
 * Admin portal header: wordmark and a way back to the shop, with no
 * storefront menu, search or bag. `actions` holds the sign-out button
 * (passed in by the route, because modules don't import each other).
 */
export function AdminHeader({ actions }: { actions?: ReactNode }) {
  return (
    <header className="sticky top-0 z-40 border-b bg-canvas">
      <div className="container-page flex h-header items-center justify-between gap-4">
        <Link href="/admin" aria-label="Atelier admin overview" className="flex items-baseline gap-3">
          <span className="font-display text-[1.25rem] leading-none tracking-[0.32em] lg:text-[1.5rem]">
            ATELIER
          </span>
          <span className="border px-2 py-0.5 type-micro text-ink-muted">Admin</span>
        </Link>

        <div className="flex items-center gap-4 sm:gap-6">
          <Link href="/" className="hidden type-label link-quiet sm:inline">
            View shop
          </Link>
          {actions}
        </div>
      </div>
    </header>
  );
}
