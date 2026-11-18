import type { Metadata } from "next";

import { SignInPage } from "@/modules/auth";

export const metadata: Metadata = {
  title: "Sign in",
  robots: { index: false },
};

export default function Page() {
  return <SignInPage />;
}
