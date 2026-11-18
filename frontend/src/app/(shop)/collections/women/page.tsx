import type { Metadata } from "next";

import { GenderCollectionPage } from "@/modules/products";

export const metadata: Metadata = {
  title: "Women",
  description: "Shop women's ready-to-wear, shoes, bags and jewelry at Atelier.",
};

export default function WomenPage() {
  return <GenderCollectionPage gender="women" />;
}
