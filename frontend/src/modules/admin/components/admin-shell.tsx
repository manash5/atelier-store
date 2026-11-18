import { Suspense, type ReactNode } from "react";

import { AdminNav, AdminNavLinks } from "./admin-nav";

/** Layout for every /admin page: section nav plus content. */
export function AdminShell({ children }: { children: ReactNode }) {
  return (
    <div className="container-page py-section-sm lg:grid lg:grid-cols-[12rem_minmax(0,1fr)] lg:gap-12">
      <aside className="lg:sticky lg:top-[calc(var(--spacing-header)+2rem)] lg:self-start">
        <Suspense fallback={<AdminNavLinks />}>
          <AdminNav />
        </Suspense>
      </aside>
      <div className="mt-8 min-w-0 lg:mt-0">{children}</div>
    </div>
  );
}
