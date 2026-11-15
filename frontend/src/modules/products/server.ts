// Server-only data access for this module (Server Components, metadata,
// generateStaticParams).
export {
  getAllProductSlugs,
  getProduct,
  getProductsBySlugs,
  getRelatedProducts,
} from "./api/products.service";
