import type { Metadata } from "next";

import { AdminCategoriesPage } from "@/modules/admin";

export const metadata: Metadata = { title: "Categories · Admin", robots: { index: false } };

export default function Page() {
  return <AdminCategoriesPage />;
}
