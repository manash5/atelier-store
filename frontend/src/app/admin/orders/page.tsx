import type { Metadata } from "next";

import { AdminOrdersPage } from "@/modules/admin";

export const metadata: Metadata = { title: "Orders · Admin", robots: { index: false } };

export default function Page({ searchParams }: PageProps<"/admin/orders">) {
  return <AdminOrdersPage searchParams={searchParams} />;
}
