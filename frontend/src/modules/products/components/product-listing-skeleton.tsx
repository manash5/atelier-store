/** Loading state shaped like ProductListingPage. */
export function ProductListingSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading products" className="pb-section">
      <div className="container-page flex animate-pulse flex-col items-center pt-section-sm pb-8 lg:pb-12">
        <div className="h-3 w-20 bg-surface-strong" />
        <div className="mt-5 h-12 w-64 max-w-full bg-surface-strong" />
      </div>
      <div className="container-page">
        <div className="border-t py-4">
          <div className="h-3 w-16 animate-pulse bg-surface-strong" />
        </div>
        <ul className="mt-2 grid-products animate-pulse md:mt-4">
          {Array.from({ length: 8 }, (_, index) => (
            <li key={index}>
              <div className="aspect-product bg-surface" />
              <div className="mt-3 h-4 w-3/4 bg-surface-strong md:mt-4" />
              <div className="mt-2 h-4 w-1/4 bg-surface-strong" />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
