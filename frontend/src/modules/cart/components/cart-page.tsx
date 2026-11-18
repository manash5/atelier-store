import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import { getCart } from "../api/cart.service";
import type { Cart } from "../types";
import { CartLine } from "./cart-line";
import { OrderTotals } from "./order-totals";

const promises = [
  "Complimentary express shipping",
  "Returns and exchanges within 30 days",
  "Gift wrapping with a handwritten card",
];

function CartSummary({ cart }: { cart: Cart }) {
  return (
    <aside
      aria-labelledby="summary-title"
      className="self-start bg-surface px-6 py-8 lg:sticky lg:top-[calc(var(--spacing-header)+2rem)] lg:px-8"
    >
      <h2 id="summary-title" className="type-title">
        Order summary
      </h2>
      <div className="mt-6">
        <OrderTotals itemCount={cart.itemCount} subtotal={cart.subtotal} total={cart.subtotal} />
      </div>

      {cart.hasIssues ? (
        <>
          <p role="status" className="mt-6 border border-sale px-4 py-3 type-caption text-sale">
            Some items have changed availability. Update them to continue.
          </p>
          <button type="button" className="mt-4 btn btn-primary w-full" disabled>
            Proceed to checkout
          </button>
        </>
      ) : (
        <Link href="/checkout" className="mt-8 btn btn-primary w-full">
          Proceed to checkout
        </Link>
      )}

      <ul className="mt-8 flex flex-col gap-2 border-t pt-6">
        {promises.map((promise) => (
          <li key={promise} className="flex items-center gap-2.5 type-caption text-ink-muted">
            <span aria-hidden="true" className="size-1.5 shrink-0 rounded-full bg-ink-subtle" />
            {promise}
          </li>
        ))}
      </ul>
    </aside>
  );
}

function EmptyBag() {
  return (
    <div className="flex flex-col items-center border-t py-section-sm text-center">
      <p className="type-title">Your bag is empty</p>
      <p className="mt-3 max-w-md type-body-lg text-ink-muted">
        Pieces you add will wait here until you are ready to check out.
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link href="/collections/new-in" className="btn btn-primary">
          Shop new arrivals
        </Link>
        <Link href="/collections/gifts" className="btn btn-secondary">
          Discover gifts
        </Link>
      </div>
    </div>
  );
}

async function CartContent() {
  const cart = await getCart();
  if (!cart) redirect("/sign-in?next=/bag");

  if (cart.items.length === 0) return <EmptyBag />;

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_24rem] lg:gap-16">
      <section aria-labelledby="bag-items-title">
        <h2 id="bag-items-title" className="border-t py-4 type-label text-ink-muted">
          {cart.itemCount} {cart.itemCount === 1 ? "item" : "items"}
        </h2>
        <ul className="divide-y border-y">
          {cart.items.map((line) => (
            <CartLine key={line.product.slug} line={line} />
          ))}
        </ul>
        <Link href="/collections/new-in" className="mt-6 inline-block type-label link">
          Continue shopping
        </Link>
      </section>

      <CartSummary cart={cart} />
    </div>
  );
}

function CartSkeleton() {
  return (
    <div aria-hidden className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_24rem] lg:gap-16">
      <div className="border-t">
        {Array.from({ length: 2 }, (_, index) => (
          <div key={index} className="grid grid-cols-[6rem_1fr] gap-5 border-b py-6 sm:grid-cols-[8rem_1fr] sm:gap-8">
            <div className="aspect-product bg-surface" />
            <div className="flex flex-col gap-3">
              <div className="h-5 w-1/2 bg-surface" />
              <div className="h-4 w-1/3 bg-surface" />
            </div>
          </div>
        ))}
      </div>
      <div className="h-80 bg-surface" />
    </div>
  );
}

export function CartPage() {
  return (
    <section aria-labelledby="bag-title" className="pb-section">
      <header className="container-page pt-section-sm pb-8 text-center lg:pb-12">
        <p className="type-label text-ink-muted">Shopping bag</p>
        <h1 id="bag-title" className="mt-4 type-display">
          Your Bag
        </h1>
      </header>
      <div className="container-page">
        <Suspense fallback={<CartSkeleton />}>
          <CartContent />
        </Suspense>
      </div>
    </section>
  );
}
