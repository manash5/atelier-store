// Server-only data access for this module (Server Components, metadata,
// generateStaticParams).
export {
  getAllProductSlugs,
  getNewArrivals,
  getProduct,
  getProductsByCategory,
  getProductsByGender,
  getProductsBySlugs,
  getRelatedProducts,
} from "./api/products.service";
