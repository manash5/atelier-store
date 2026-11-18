import { formatPrice } from "@/shared/lib/format-price";
import type { Money } from "@/shared/types/api";

type OrderTotalsProps = {
  itemCount: number;
  subtotal: Money;
  /** Omit while shipping is complimentary on every order. */
  shipping?: Money;
  total: Money;
};

/** Subtotal, shipping and total rows shared by the bag, checkout and confirmation. */
export function OrderTotals({ itemCount, subtotal, shipping, total }: OrderTotalsProps) {
  return (
    <dl className="flex flex-col gap-3 type-body">
      <div className="flex justify-between gap-4">
        <dt className="text-ink-muted">
          Subtotal ({itemCount} {itemCount === 1 ? "item" : "items"})
        </dt>
        <dd>{formatPrice(subtotal)}</dd>
      </div>
      <div className="flex justify-between gap-4">
        <dt className="text-ink-muted">Shipping</dt>
        <dd>{shipping && shipping.amount > 0 ? formatPrice(shipping) : "Complimentary"}</dd>
      </div>
      <div className="mt-2 flex justify-between gap-4 border-t pt-5">
        <dt className="type-label">Total</dt>
        <dd className="type-title">{formatPrice(total)}</dd>
      </div>
    </dl>
  );
}
