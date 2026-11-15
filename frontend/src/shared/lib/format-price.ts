import type { Money } from "@/shared/types/api";

const formatters = new Map<string, Intl.NumberFormat>();

/** Formats integer minor units, e.g. { amount: 125000, currency: "USD" } → "$1,250". */
export function formatPrice({ amount, currency }: Money) {
  let formatter = formatters.get(currency);
  if (!formatter) {
    formatter = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    });
    formatters.set(currency, formatter);
  }
  return formatter.format(amount / 100);
}
