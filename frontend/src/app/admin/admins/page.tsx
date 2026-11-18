import type { Metadata } from "next";

import { AdminAdminsPage } from "@/modules/admin";

export const metadata: Metadata = { title: "Admins · Admin", robots: { index: false } };

export default function Page({ searchParams }: PageProps<"/admin/admins">) {
  return <AdminAdminsPage searchParams={searchParams} />;
}
