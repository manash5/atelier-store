"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/admin", label: "Overview", exact: true },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/appointments", label: "Appointments" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/categories", label: "Categories" },
  { href: "/admin/admins", label: "Admins" },
];

/** Sidebar on large screens, a scrollable tab row on small ones. */
export function AdminNav() {
  return <AdminNavLinks pathname={usePathname()} />;
}

/** The links without an active state (Suspense fallback while the URL is read). */
export function AdminNavLinks({ pathname }: { pathname?: string }) {
  return (
    <nav aria-label="Admin">
      <ul className="-mx-gutter flex gap-6 overflow-x-auto border-b px-gutter lg:mx-0 lg:flex-col lg:gap-1 lg:border-b-0 lg:px-0">
        {LINKS.map((link) => {
          const active =
            pathname !== undefined &&
            (link.exact ? pathname === link.href : pathname.startsWith(link.href));
          return (
            <li key={link.href} className="shrink-0">
              <Link
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={`block border-b-2 py-3 type-label lg:border-b-0 lg:border-l-2 lg:py-2.5 lg:pl-4 ${
                  active
                    ? "border-ink text-ink"
                    : "border-transparent text-ink-muted hover:text-ink"
                }`}
              >
                {link.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
