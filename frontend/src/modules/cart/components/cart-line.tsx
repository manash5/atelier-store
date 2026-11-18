import Image from "next/image";
import Link from "next/link";

import { formatPrice } from "@/shared/lib/format-price";

import type { CartLine as CartLineType } from "../types";
import { CartLineControls } from "./cart-line-controls";

function LineStatus({ line }: { line: CartLineType }) {
  if (line.issue === "sold-out") {
    return (
      <p className="flex items-center gap-2 type-caption text-sale">
        <span aria-hidden="true" className="size-2 shrink-0 rounded-full bg-sale" />
        Sold out. Remove it to continue to checkout.
      </p>
    );
  }
  if (line.issue === "insufficient-stock") {
    return (
      <p className="flex items-center gap-2 type-caption text-sale">
        <span aria-hidden="true" className="size-2 shrink-0 rounded-full bg-sale" />
        Only {line.product.stock} left. Lower the quantity to continue.
      </p>
    );
  }
  if (line.product.stockStatus === "low-stock") {
    return (
      <p className="flex items-center gap-2 type-caption text-ink-muted">
        <span aria-hidden="true" className="size-2 shrink-0 rounded-full bg-sale" />
        Low stock: only {line.product.stock} left
      </p>
    );
  }
  return (
    <p className="flex items-center gap-2 type-caption text-ink-muted">
      <span aria-hidden="true" className="size-2 shrink-0 rounded-full bg-success" />
      In stock, ships within 2 business days
    </p>
  );
}

export function CartLine({ line }: { line: CartLineType }) {
  const { product } = line;
  const href = `/products/${product.slug}`;

  return (
    <li className="grid grid-cols-[6rem_minmax(0,1fr)] gap-5 py-6 sm:grid-cols-[8rem_minmax(0,1fr)] sm:gap-8">
      <Link href={href} className="group block" tabIndex={-1} aria-hidden="true">
        <div className="media-frame aspect-product">
          <Image
            src={product.image.src}
            alt=""
            fill
            sizes="(min-width: 640px) 8rem, 6rem"
            style={{ objectPosition: product.image.position }}
            className={`transition-transform duration-700 ease-standard group-hover:scale-[1.03] ${line.issue === "sold-out" ? "opacity-60" : ""}`}
          />
        </div>
      </Link>

      <div className="flex min-w-0 flex-col gap-4">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
          <div className="min-w-0">
            <h3 className="type-body">
              <Link href={href} className="hover:underline hover:underline-offset-4">
                {product.name}
              </Link>
            </h3>
            <p className="mt-1 flex items-center gap-2 type-caption text-ink-muted">
              <span
                aria-hidden="true"
                className="size-3 shrink-0 rounded-full border border-line-strong"
                style={{ backgroundColor: product.color.hex }}
              />
              {product.color.name}
              <span aria-hidden="true">·</span>
              {formatPrice(product.price)} each
            </p>
          </div>
          <p className="type-body sm:text-right">{formatPrice(line.lineTotal)}</p>
        </div>

        <LineStatus line={line} />

        <CartLineControls
          slug={product.slug}
          name={product.name}
          quantity={line.quantity}
          maxQuantity={line.maxQuantity}
        />
      </div>
    </li>
  );
}
