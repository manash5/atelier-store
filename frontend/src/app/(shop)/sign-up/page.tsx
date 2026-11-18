import type { Metadata } from "next";

import { SignUpPage } from "@/modules/auth";

export const metadata: Metadata = {
  title: "Create account",
  robots: { index: false },
};

export default function Page() {
  return <SignUpPage />;
}
