import type { Metadata } from "next";

import { AccountPage } from "@/modules/auth";
import { AccountBagSection } from "@/modules/cart";

export const metadata: Metadata = {
  title: "My account",
  robots: { index: false },
};

export default function Page() {
  return (
    <AccountPage>
      <AccountBagSection />
    </AccountPage>
  );
}
