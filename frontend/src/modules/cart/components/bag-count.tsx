import { getCartCount } from "../api/cart.service";

/** Item count badge for the header bag icon. Render inside <Suspense>. */
export async function BagCount() {
  const count = await getCartCount();
  if (count === 0) return null;

  const label = count > 99 ? "99+" : String(count);
  return (
    <>
      <span className="sr-only">
        , {count} {count === 1 ? "item" : "items"}
      </span>
      <span
        aria-hidden="true"
        className="absolute top-1.5 right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-ink px-1 text-[0.625rem] leading-none font-medium text-canvas"
      >
        {label}
      </span>
    </>
  );
}
