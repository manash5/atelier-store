import type { ReactNode } from "react";

import { AdminHeader, AdminShell } from "@/modules/admin";
import { SignOutButton } from "@/modules/auth";

// Admin portal chrome: its own header (no storefront menu, search or bag)
// and no footer. proxy.ts lets only admins reach /admin; the API re-checks
// every request.
export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <AdminHeader actions={<SignOutButton compact />} />
      <main id="main" className="flex-1">
        <AdminShell>{children}</AdminShell>
      </main>
    </>
  );
}
