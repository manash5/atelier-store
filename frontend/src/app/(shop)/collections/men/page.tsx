import type { Metadata } from "next";

import { GenderCollectionPage } from "@/modules/products";

export const metadata: Metadata = {
  title: "Men",
  description: "Shop men's ready-to-wear, shoes and accessories at Atelier.",
};

export default function MenPage() {
  return <GenderCollectionPage gender="men" />;
}
