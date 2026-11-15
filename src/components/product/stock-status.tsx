import { getStockStatus, type Product } from "@/lib/catalog";

const tone = {
  "in-stock": "bg-success",
  "low-stock": "bg-sale",
  "sold-out": "bg-ink-subtle",
} as const;

export function StockStatus({ product }: { product: Product }) {
  const status = getStockStatus(product);

  const label =
    status === "sold-out"
      ? "Sold out"
      : status === "low-stock"
        ? `Low stock: only ${product.stock} left`
        : "In stock";

  const note =
    status === "sold-out"
      ? "Contact a client advisor to hear if this piece returns."
      : "Ships within 2 business days.";

  return (
    <div>
      <p className="flex items-center gap-2.5 type-body">
        <span
          aria-hidden="true"
          className={`size-2 shrink-0 rounded-full ${tone[status]}`}
        />
        {label}
      </p>
      <p className="mt-1 pl-[1.125rem] type-caption text-ink-muted">{note}</p>
    </div>
  );
}
