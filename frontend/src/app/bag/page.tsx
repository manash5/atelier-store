import type { Metadata } from "next";

import { CartPage } from "@/modules/cart";

export const metadata: Metadata = {
  title: "Your bag",
  robots: { index: false },
};

export default function Page() {
  return <CartPage />;
}
