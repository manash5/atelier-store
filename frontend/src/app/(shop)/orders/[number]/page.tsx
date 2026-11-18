import type { Metadata } from "next";

import { OrderConfirmationPage } from "@/modules/cart";

export const metadata: Metadata = {
  title: "Order confirmed",
  robots: { index: false },
};

// Request-specific (the signed-in user's order): params are awaited inside
// the Suspense boundary in OrderConfirmationPage.
export default function Page({ params }: PageProps<"/orders/[number]">) {
  return <OrderConfirmationPage params={params} />;
}
