"use client";

import Link from "next/link";
import { useRef, type MouseEvent } from "react";

import { CloseIcon, MenuIcon } from "@/shared/ui/icons";

type NavItem = { label: string; href: string };

const secondaryLinks: NavItem[] = [
  { label: "Sign in", href: "/sign-in" },
  { label: "Book an appointment", href: "/services/appointments" },
  { label: "Client services", href: "/client-services" },
];

// Slide-in navigation built on the native Popover API: the browser handles
// open/close, Esc, light dismiss, top-layer stacking and focus order.
export function MenuDrawer({ items }: { items: readonly NavItem[] }) {
  const drawer = useRef<HTMLDivElement>(null);

  // Client-side navigation keeps the layout mounted, so close the drawer
  // ourselves whenever one of its links is followed.
  function closeOnNavigate(event: MouseEvent<HTMLElement>) {
    if ((event.target as Element).closest("a")) {
      drawer.current?.hidePopover();
    }
  }

  return (
    <>
      <button
        type="button"
        popoverTarget="site-menu"
        className="btn btn-ghost btn-icon lg:w-auto lg:px-3"
      >
        <MenuIcon />
        <span className="sr-only lg:not-sr-only">Menu</span>
      </button>

      <div
        ref={drawer}
        id="site-menu"
        popover="auto"
        role="dialog"
        aria-label="Site menu"
        className="fixed inset-y-0 left-0 h-dvh w-full max-w-sm -translate-x-full overflow-y-auto border-r bg-canvas text-ink transition-[translate,display,overlay] transition-discrete duration-300 backdrop:bg-overlay open:translate-x-0 starting:open:-translate-x-full"
      >
        <div className="flex h-header items-center justify-between border-b px-gutter">
          <span className="type-label">Menu</span>
          <button
            type="button"
            popoverTarget="site-menu"
            popoverTargetAction="hide"
            className="-mr-3 btn btn-ghost btn-icon"
            aria-label="Close menu"
          >
            <CloseIcon />
          </button>
        </div>

        <div onClick={closeOnNavigate}>
          <nav aria-label="Main" className="px-gutter py-6">
            <ul>
              {items.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="block py-2.5 type-heading link-quiet"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <ul className="flex flex-col gap-4 border-t px-gutter py-8">
            {secondaryLinks.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="type-body link-muted">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
}
