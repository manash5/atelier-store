import { Suspense, type ReactNode } from "react";

import { BagCount } from "@/modules/cart";
import { SiteFooter } from "@/shared/layout/site-footer";
import { SiteHeader } from "@/shared/layout/site-header";

// Storefront chrome: announcement bar, header with menu, search and bag,
// and the footer. The admin portal (app/admin) has its own layout.
export default function ShopLayout({ children }: { children: ReactNode }) {
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
        {children}
      </main>
      <SiteFooter />
    </>
  );
}
