// Editorial photography: Unsplash (https://unsplash.com/license). Only
// unbranded imagery is used so no third-party logos appear on the storefront.

export function unsplash(id: string, width = 2000) {
  return `https://images.unsplash.com/photo-${id}?w=${width}&q=80`;
}
