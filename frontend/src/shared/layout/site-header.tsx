import Link from "next/link";

import { BagIcon, SearchIcon, UserIcon } from "@/shared/ui/icons";
import { MenuDrawer } from "./menu-drawer";
import { navigation } from "./navigation";

export function SiteHeader() {
  return (
    <>
      <p className="flex h-announcement items-center justify-center bg-ink px-gutter type-micro text-canvas">
        <span className="truncate">Complimentary express shipping &amp; returns</span>
      </p>

      <header className="sticky top-0 z-40 border-b bg-canvas">
        <div className="container-page grid h-header grid-cols-[1fr_auto_1fr] items-center">
          <div className="-ml-3 flex items-center">
            <MenuDrawer items={navigation} />
            <Link
              href="/search"
              className="btn btn-ghost btn-icon"
              aria-label="Search"
            >
              <SearchIcon />
            </Link>
          </div>

          {/* Negative right margin cancels the trailing letter-spacing so
              the wordmark is optically centered. */}
          <Link
            href="/"
            aria-label="Atelier home"
            className="-mr-[0.32em] font-display text-[1.375rem] leading-none tracking-[0.32em] lg:text-[1.75rem]"
          >
            ATELIER
          </Link>

          <div className="-mr-3 flex items-center justify-end">
            <Link
              href="/account"
              className="hidden btn btn-ghost btn-icon sm:inline-flex"
              aria-label="Account"
            >
              <UserIcon />
            </Link>
            <Link
              href="/bag"
              className="btn btn-ghost btn-icon"
              aria-label="Shopping bag"
            >
              <BagIcon />
            </Link>
          </div>
        </div>
      </header>
    </>
  );
}
