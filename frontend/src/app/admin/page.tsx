import type { Metadata } from "next";

import { AdminPage } from "@/modules/auth";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false },
};

export default function Page() {
  return <AdminPage />;
}
