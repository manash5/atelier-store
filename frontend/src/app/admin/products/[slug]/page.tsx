import type { Metadata } from "next";

import { AdminEditProductPage } from "@/modules/admin";

export const metadata: Metadata = { title: "Edit product · Admin", robots: { index: false } };

export default function Page({ params, searchParams }: PageProps<"/admin/products/[slug]">) {
  return <AdminEditProductPage params={params} searchParams={searchParams} />;
}
