import type { Metadata } from "next";

import { AdminOverviewPage } from "@/modules/admin";

export const metadata: Metadata = { title: "Admin", robots: { index: false } };

export default function Page() {
  return <AdminOverviewPage />;
}
