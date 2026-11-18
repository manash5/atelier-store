import type { Metadata, Viewport } from "next";
import { Bodoni_Moda, Inter } from "next/font/google";

import "./globals.css";

// UI and body text.
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

// Display headings only (type-display-xl / type-display / type-heading).
const bodoni = Bodoni_Moda({
  variable: "--font-bodoni",
  subsets: ["latin"],
  display: "swap",
  axes: ["opsz"],
});

export const metadata: Metadata = {
  title: {
    default: "Atelier — Ready-to-wear, leather goods and jewelry",
    template: "%s | Atelier",
  },
  description:
    "Ready-to-wear, shoes, bags and jewelry, made slowly and finished by hand.",
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
  colorScheme: "light",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} ${bodoni.variable} h-full`}>
      <body className="flex min-h-full flex-col">
        <a
          href="#main"
          className="sr-only bg-ink px-5 py-3 type-label text-canvas focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50"
        >
          Skip to content
        </a>
        {/* Each area brings its own chrome: (shop)/layout.tsx for the
            storefront, admin/layout.tsx for the admin portal. */}
        {children}
      </body>
    </html>
  );
}
