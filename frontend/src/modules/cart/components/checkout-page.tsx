import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import { formatPrice } from "@/shared/lib/format-price";

import { getCart } from "../api/cart.service";
import { CheckoutForm } from "./checkout-form";
import { OrderItemList } from "./order-item-list";
import { OrderTotals } from "./order-totals";

async function CheckoutContent() {
  const cart = await getCart();
  if (!cart) redirect("/sign-in?next=/checkout");
  // Nothing to buy, or something needs attention first: back to the bag.
  if (cart.items.length === 0 || cart.hasIssues) redirect("/bag");

  return (
    <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_24rem] lg:gap-16">
      <div className="order-2 lg:order-1">
        <CheckoutForm totalLabel={formatPrice(cart.subtotal)} />
      </div>

      <aside
        aria-labelledby="checkout-summary-title"
        className="order-1 self-start bg-surface px-6 py-8 lg:sticky lg:top-[calc(var(--spacing-header)+2rem)] lg:order-2 lg:px-8"
      >
        <div className="flex items-baseline justify-between gap-4">
          <h2 id="checkout-summary-title" className="type-title">
            Your order
          </h2>
          <Link href="/bag" className="type-label link">
            Edit bag
          </Link>
        </div>
        <div className="mt-6 border-b pb-6">
          <OrderItemList
            items={cart.items.map((line) => ({
              key: line.product.slug,
              name: line.product.name,
              colorName: line.product.color.name,
              image: line.product.image,
              quantity: line.quantity,
              lineTotal: line.lineTotal,
            }))}
          />
        </div>
        <div className="mt-6">
          <OrderTotals itemCount={cart.itemCount} subtotal={cart.subtotal} total={cart.subtotal} />
        </div>
      </aside>
    </div>
  );
}

function CheckoutSkeleton() {
  return (
    <div aria-hidden className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_24rem] lg:gap-16">
      <div className="flex flex-col gap-6">
        {Array.from({ length: 6 }, (_, index) => (
          <div key={index} className="h-20 bg-surface" />
        ))}
      </div>
      <div className="h-96 bg-surface" />
    </div>
  );
}

export function CheckoutPage() {
  return (
    <section aria-labelledby="checkout-title" className="pb-section">
      <header className="container-page pt-section-sm pb-8 text-center lg:pb-12">
        <p className="type-label text-ink-muted">Secure checkout</p>
        <h1 id="checkout-title" className="mt-4 type-display">
          Checkout
        </h1>
      </header>
      <div className="container-page">
        <Suspense fallback={<CheckoutSkeleton />}>
          <CheckoutContent />
        </Suspense>
      </div>
    </section>
  );
}
