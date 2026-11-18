import type { Metadata } from "next";

import { AdminNewProductPage } from "@/modules/admin";

export const metadata: Metadata = { title: "New product · Admin", robots: { index: false } };

export default function Page() {
  return <AdminNewProductPage />;
}
