import type { Metadata } from "next";

import { AdminProductsPage } from "@/modules/admin";

export const metadata: Metadata = { title: "Products · Admin", robots: { index: false } };

export default function Page({ searchParams }: PageProps<"/admin/products">) {
  return <AdminProductsPage searchParams={searchParams} />;
}
