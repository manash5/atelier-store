import type { Metadata } from "next";

import { GiftsPage } from "@/modules/products";

export const metadata: Metadata = {
  title: "Gifts",
  description: "The Atelier Gift Edit: considered pieces chosen for giving.",
};

export default function GiftsRoute() {
  return <GiftsPage />;
}
