import type { Metadata } from "next";

import { AdminOrderDetailPage } from "@/modules/admin";

export const metadata: Metadata = { title: "Order · Admin", robots: { index: false } };

export default function Page({ params }: PageProps<"/admin/orders/[number]">) {
  return <AdminOrderDetailPage params={params} />;
}
