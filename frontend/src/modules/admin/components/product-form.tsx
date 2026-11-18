"use client";

import { useActionState, useState } from "react";

import type { Image } from "@/shared/types/image";

import { createProductAction, updateProductAction } from "../actions";
import type { AdminCategory, AdminProduct, FormState } from "../types";
import { ImageListField } from "./image-list-field";
import { Field, FormMessage } from "./ui";

const initialState: FormState = {};

function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 100);
}

type ProductFormProps = {
  categories: AdminCategory[];
  /** Omit to create a new product. */
  product?: AdminProduct;
};

function parseImages(raw: string | undefined): Image[] | undefined {
  if (!raw) return undefined;
  try {
    const value: unknown = JSON.parse(raw);
    return Array.isArray(value) ? (value as Image[]) : undefined;
  } catch {
    return undefined;
  }
}

export function ProductForm({ categories, product }: ProductFormProps) {
  const editing = product !== undefined;
  const [state, formAction, pending] = useActionState(
    editing ? updateProductAction : createProductAction,
    initialState,
  );

  return (
    // Re-mount the fields after a failed save so they show what was submitted.
    <form
      action={formAction}
      noValidate
      className="flex flex-col gap-10"
      key={JSON.stringify(state.values ?? null)}
    >
      <FormMessage status={state.status} message={state.message} />
      <ProductFields categories={categories} product={product} state={state} pending={pending} />
    </form>
  );
}

function ProductFields({
  categories,
  product,
  state,
  pending,
}: ProductFormProps & { state: FormState; pending: boolean }) {
  const editing = product !== undefined;
  const v = state.values;
  /** The submitted value after a failed save, else the saved product's. */
  const initial = (field: string, saved: string | undefined) => v?.[field] ?? saved;
  const [slug, setSlug] = useState(initial("slug", product?.slug) ?? "");
  const [slugEdited, setSlugEdited] = useState(editing || Boolean(v?.slug));
  const [hex, setHex] = useState(initial("colorHex", product?.color.hex) ?? "#1a1a1a");
  const errors = state.fieldErrors ?? {};
  const describe = (field: string) => (errors[field] ? `product-${field}-error` : undefined);

  return (
    <>

      <section className="flex flex-col gap-6">
        <h2 className="border-b pb-3 type-title">Details</h2>
        <Field id="product-name" label="Name" error={errors.name}>
          <input
            id="product-name"
            name="name"
            required
            maxLength={120}
            defaultValue={initial("name", product?.name)}
            onChange={(event) => {
              if (!slugEdited) setSlug(slugify(event.target.value));
            }}
            aria-invalid={errors.name ? true : undefined}
            aria-describedby={describe("name")}
            className="input-base"
          />
        </Field>

        <div className="grid gap-6 sm:grid-cols-2">
          <Field
            id="product-slug"
            label="URL slug"
            error={errors.slug}
            hint={editing ? "Fixed after creation, so links and orders keep working." : `/products/${slug || "…"}`}
          >
            <input
              id="product-slug"
              name="slug"
              required
              value={slug}
              readOnly={editing}
              onChange={(event) => {
                setSlugEdited(true);
                setSlug(event.target.value);
              }}
              aria-invalid={errors.slug ? true : undefined}
              aria-describedby={describe("slug")}
              className="input-base read-only:bg-surface read-only:text-ink-muted"
            />
          </Field>
          <Field id="product-style" label="Style number" error={errors.styleNumber}>
            <input
              id="product-style"
              name="styleNumber"
              required
              maxLength={40}
              defaultValue={initial("styleNumber", product?.styleNumber)}
              aria-invalid={errors.styleNumber ? true : undefined}
              aria-describedby={describe("styleNumber")}
              className="input-base"
            />
          </Field>
        </div>

        <div className="grid gap-6 sm:grid-cols-3">
          <Field id="product-category" label="Category" error={errors.categorySlug}>
            <select
              id="product-category"
              name="categorySlug"
              required
              defaultValue={initial("categorySlug", product?.category.slug) ?? ""}
              aria-invalid={errors.categorySlug ? true : undefined}
              className="input-base"
            >
              <option value="" disabled>
                Choose…
              </option>
              {categories.map((category) => (
                <option key={category.slug} value={category.slug}>
                  {category.title}
                </option>
              ))}
            </select>
          </Field>
          <Field id="product-gender" label="Designed for">
            <select id="product-gender" name="gender" defaultValue={initial("gender", product?.gender) ?? "unisex"} className="input-base">
              <option value="women">Women</option>
              <option value="men">Men</option>
              <option value="unisex">Unisex</option>
            </select>
          </Field>
          <Field id="product-badge" label="Badge">
            <select id="product-badge" name="badge" defaultValue={initial("badge", product?.badge ?? "") ?? ""} className="input-base">
              <option value="">None</option>
              <option value="New">New</option>
              <option value="Limited">Limited</option>
            </select>
          </Field>
        </div>

        <div className="grid gap-6 sm:grid-cols-3">
          <Field id="product-price" label="Price (USD)" error={errors.price} hint="Whole dollars, e.g. 1250">
            <input
              id="product-price"
              name="price"
              inputMode="decimal"
              required
              defaultValue={initial("price", product ? String(product.price.amount / 100) : "")}
              aria-invalid={errors.price ? true : undefined}
              aria-describedby={describe("price")}
              className="input-base"
            />
          </Field>
          <Field id="product-color" label="Color" error={errors.color}>
            <input
              id="product-color"
              name="colorName"
              required
              maxLength={40}
              defaultValue={initial("colorName", product?.color.name)}
              aria-invalid={errors.color ? true : undefined}
              className="input-base"
            />
          </Field>
          <Field id="product-hex" label="Swatch">
            <div className="flex gap-2">
              <input
                type="color"
                aria-label="Pick swatch color"
                value={hex}
                onChange={(event) => setHex(event.target.value)}
                className="h-12 w-14 shrink-0 cursor-pointer border border-line-strong bg-canvas p-1"
              />
              <input
                id="product-hex"
                name="colorHex"
                value={hex}
                onChange={(event) => setHex(event.target.value)}
                pattern="#[0-9a-fA-F]{6}"
                className="input-base min-w-0"
              />
            </div>
          </Field>
        </div>

        {editing ? null : (
          <Field id="product-stock" label="Opening stock" error={errors.stock} hint="Units available to sell.">
            <input
              id="product-stock"
              name="stock"
              type="number"
              min={0}
              step={1}
              defaultValue={initial("stock", "0")}
              aria-invalid={errors.stock ? true : undefined}
              className="input-base sm:w-40"
            />
          </Field>
        )}
      </section>

      <section className="flex flex-col gap-6">
        <h2 className="border-b pb-3 type-title">Story</h2>
        <Field id="product-description" label="Description" error={errors.description}>
          <textarea
            id="product-description"
            name="description"
            required
            rows={4}
            maxLength={2000}
            defaultValue={initial("description", product?.description)}
            aria-invalid={errors.description ? true : undefined}
            className="input-base py-3"
          />
        </Field>
        <Field id="product-details" label="Details & care" error={errors.details} hint="One per line, e.g. 100% silk.">
          <textarea
            id="product-details"
            name="details"
            rows={5}
            defaultValue={initial("details", product?.details.join("\n"))}
            className="input-base py-3"
          />
        </Field>
      </section>

      <section className="flex flex-col gap-6">
        <h2 className="border-b pb-3 type-title">Images</h2>
        <ImageListField
          name="images"
          label="Gallery"
          initial={parseImages(v?.images) ?? product?.images ?? []}
          max={8}
          error={errors.images}
          hint="The first image is used on listings and in orders. Up to 8."
        />
      </section>

      <div className="flex flex-col gap-3 border-t pt-6 sm:flex-row">
        <button type="submit" className="btn btn-primary" disabled={pending}>
          {pending ? "Saving…" : editing ? "Save changes" : "Create product"}
        </button>
      </div>
    </>
  );
}
