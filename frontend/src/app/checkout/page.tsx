import type { Metadata } from "next";

import { CheckoutPage } from "@/modules/cart";

export const metadata: Metadata = {
  title: "Checkout",
  robots: { index: false },
};

export default function Page() {
  return <CheckoutPage />;
}
