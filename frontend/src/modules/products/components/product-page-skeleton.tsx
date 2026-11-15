/** Loading state shaped like the final product page layout. */
export function ProductPageSkeleton() {
  return (
    <div
      aria-busy="true"
      aria-label="Loading product"
      className="mx-auto max-w-page md:grid md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)]"
    >
      <div className="aspect-product animate-pulse bg-surface" />
      <div className="px-gutter pt-6 md:pt-10 md:pl-8 lg:px-12 lg:pt-12 xl:px-20">
        <div className="flex max-w-md animate-pulse flex-col gap-4">
          <div className="h-3 w-28 bg-surface-strong" />
          <div className="h-9 w-4/5 bg-surface-strong" />
          <div className="h-5 w-20 bg-surface-strong" />
          <div className="mt-8 h-12 w-full bg-surface-strong" />
        </div>
      </div>
    </div>
  );
}
