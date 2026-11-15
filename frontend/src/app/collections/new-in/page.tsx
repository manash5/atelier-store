import type { Metadata } from "next";

import { NewArrivalsPage } from "@/modules/products";

export const metadata: Metadata = {
  title: "New Arrivals",
  description:
    "The latest arrivals at Atelier: new ready-to-wear, shoes, bags and jewelry.",
};

export default function NewInPage() {
  return <NewArrivalsPage />;
}
