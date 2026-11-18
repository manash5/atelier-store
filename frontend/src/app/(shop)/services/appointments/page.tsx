import type { Metadata } from "next";

import { AppointmentPage } from "@/modules/services";

export const metadata: Metadata = {
  title: "Book an appointment",
  description:
    "Shop with an Atelier client advisor in-store or by video call, with pieces selected for you in advance.",
};

export default function AppointmentsRoute() {
  return <AppointmentPage />;
}
