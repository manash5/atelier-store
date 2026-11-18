import type { Metadata } from "next";

import { AdminAppointmentsPage } from "@/modules/admin";

export const metadata: Metadata = { title: "Appointments · Admin", robots: { index: false } };

export default function Page({ searchParams }: PageProps<"/admin/appointments">) {
  return <AdminAppointmentsPage searchParams={searchParams} />;
}
