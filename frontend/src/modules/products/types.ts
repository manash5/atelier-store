import type { ApiSuccess, Money, PaginationMeta } from "@/shared/types/api";
import type { Image } from "@/shared/types/image";

// Mirrors ProductDto in docs/api/api-contracts.md.

/** Derived by the backend from `stock`; never recompute it here. */
export type StockStatus = "in-stock" | "low-stock" | "sold-out";

export type Product = {
  slug: string;
  name: string;
  styleNumber: string;
  category: { slug: string; title: string };
  price: Money;
  color: { name: string; hex: string };
  /** Units available to sell. */
  stock: number;
  stockStatus: StockStatus;
  description: string;
  details: string[];
  /** First image is the primary/listing image. */
  images: [Image, ...Image[]];
  badge: "New" | "Limited" | null;
};

export type ProductResponse = ApiSuccess<Product>;
export type ProductListResponse = ApiSuccess<Product[], PaginationMeta>;
