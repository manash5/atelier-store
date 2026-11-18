import type { Image } from "@/shared/types/image";

import type { CategoryInput, FormState, ProductBadge, ProductGender, ProductInput } from "../types";

// Turns admin form submissions into API bodies. Checks here only give quick,
// friendly messages; the API validates everything again.

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const GENDERS: ProductGender[] = ["women", "men", "unisex"];
const BADGES: ProductBadge[] = ["New", "Limited"];

type Parsed<T> = { ok: true; input: T } | { ok: false; state: FormState };

function text(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

function parseImages(raw: string): Image[] | null {
  try {
    const value: unknown = JSON.parse(raw || "[]");
    if (!Array.isArray(value)) return null;
    return value
      .filter((item): item is Image => typeof item?.src === "string" && typeof item?.alt === "string")
      .map((item) => ({
        src: item.src.trim(),
        alt: item.alt.trim(),
        ...(item.position?.trim() ? { position: item.position.trim() } : {}),
      }));
  } catch {
    return null;
  }
}

/** "1,250" or "1250.50" (whole currency units) → integer minor units. */
export function parsePrice(raw: string): number | null {
  const normalized = raw.replace(/[,\s$]/g, "");
  if (!/^\d+(\.\d{1,2})?$/.test(normalized)) return null;
  return Math.round(Number(normalized) * 100);
}

export function parseProductForm(formData: FormData, mode: "create" | "edit"): Parsed<ProductInput> {
  const fieldErrors: Record<string, string> = {};

  const slug = text(formData, "slug");
  if (mode === "create" && !SLUG.test(slug)) {
    fieldErrors.slug = "Use lowercase letters, numbers and single hyphens.";
  }
  const name = text(formData, "name");
  if (!name) fieldErrors.name = "Enter a name.";
  const styleNumber = text(formData, "styleNumber");
  if (!styleNumber) fieldErrors.styleNumber = "Enter a style number.";
  const categorySlug = text(formData, "categorySlug");
  if (!categorySlug) fieldErrors.categorySlug = "Choose a category.";

  const price = parsePrice(text(formData, "price"));
  if (price === null) fieldErrors.price = "Enter a price such as 1250 or 1250.50.";

  const colorName = text(formData, "colorName");
  if (!colorName) fieldErrors.color = "Enter a color name.";
  const colorHex = text(formData, "colorHex");

  const stock = mode === "create" ? Number(text(formData, "stock") || "0") : 0;
  if (mode === "create" && (!Number.isInteger(stock) || stock < 0)) {
    fieldErrors.stock = "Enter a whole number, 0 or more.";
  }

  const description = text(formData, "description");
  if (!description) fieldErrors.description = "Enter a description.";
  const details = text(formData, "details")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const images = parseImages(text(formData, "images"));
  if (!images || images.length === 0) fieldErrors.images = "Add at least one image.";
  else if (images.some((image) => !image.alt)) fieldErrors.images = "Describe every image (alt text).";

  const gender = text(formData, "gender") as ProductGender;
  const badgeRaw = text(formData, "badge");
  const badge = BADGES.includes(badgeRaw as ProductBadge) ? (badgeRaw as ProductBadge) : null;

  if (Object.keys(fieldErrors).length > 0) {
    return { ok: false, state: { status: "error", message: "Check the highlighted fields.", fieldErrors } };
  }

  return {
    ok: true,
    input: {
      slug,
      name,
      styleNumber,
      categorySlug,
      price: price!,
      currency: "USD",
      color: { name: colorName, hex: colorHex },
      stock,
      description,
      details,
      images: images!,
      badge,
      gender: GENDERS.includes(gender) ? gender : "unisex",
    },
  };
}

export function parseCategoryForm(formData: FormData): Parsed<CategoryInput> {
  const fieldErrors: Record<string, string> = {};
  const slug = text(formData, "slug");
  if (!SLUG.test(slug)) fieldErrors.slug = "Use lowercase letters, numbers and single hyphens.";
  const title = text(formData, "title");
  if (!title) fieldErrors.title = "Enter a title.";
  const sortOrderRaw = text(formData, "sortOrder");
  const sortOrder = sortOrderRaw === "" ? undefined : Number(sortOrderRaw);
  if (sortOrder !== undefined && (!Number.isInteger(sortOrder) || sortOrder < 0)) {
    fieldErrors.sortOrder = "Enter a whole number, 0 or more.";
  }
  const images = parseImages(text(formData, "image"));
  const image = images?.[0] ?? null;
  if (image && !image.alt) fieldErrors.image = "Describe the image (alt text).";

  if (Object.keys(fieldErrors).length > 0) {
    return { ok: false, state: { status: "error", message: "Check the highlighted fields.", fieldErrors } };
  }
  return { ok: true, input: { slug, title, image, ...(sortOrder !== undefined ? { sortOrder } : {}) } };
}
