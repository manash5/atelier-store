import Image from "next/image";

import { formatPrice } from "@/shared/lib/format-price";
import type { Money } from "@/shared/types/api";
import type { Image as ImageType } from "@/shared/types/image";

export type OrderItemRow = {
  key: string;
  name: string;
  colorName: string;
  image: ImageType;
  quantity: number;
  lineTotal: Money;
};

/** Compact item rows for checkout and order summaries. */
export function OrderItemList({ items }: { items: OrderItemRow[] }) {
  return (
    <ul className="flex flex-col gap-5">
      {items.map((item) => (
        <li key={item.key} className="grid grid-cols-[4rem_minmax(0,1fr)_auto] items-start gap-4">
          <div className="media-frame aspect-product">
            <Image
              src={item.image.src}
              alt=""
              fill
              sizes="4rem"
              style={{ objectPosition: item.image.position }}
            />
          </div>
          <div className="min-w-0">
            <p className="type-body">{item.name}</p>
            <p className="mt-1 type-caption text-ink-muted">
              {item.colorName} · Qty {item.quantity}
            </p>
          </div>
          <p className="type-body">{formatPrice(item.lineTotal)}</p>
        </li>
      ))}
    </ul>
  );
}
