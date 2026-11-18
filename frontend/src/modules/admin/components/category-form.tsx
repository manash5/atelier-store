"use client";

import { useActionState } from "react";

import type { Image } from "@/shared/types/image";

import { saveCategoryAction } from "../actions";
import type { AdminCategory, FormState } from "../types";
import { ImageListField } from "./image-list-field";
import { Field, FormMessage } from "./ui";

const initialState: FormState = {};

function parseImages(raw: string | undefined): Image[] | undefined {
  if (!raw) return undefined;
  try {
    const value: unknown = JSON.parse(raw);
    return Array.isArray(value) ? (value as Image[]) : undefined;
  } catch {
    return undefined;
  }
}

/** Creates a category, or edits one when `category` is given (slug fixed). */
export function CategoryForm({ category }: { category?: AdminCategory }) {
  const editing = category !== undefined;
  const [state, formAction, pending] = useActionState(saveCategoryAction, initialState);
  const errors = state.fieldErrors ?? {};
  const prefix = `category-${category?.slug ?? "new"}`;

  return (
    <form
      action={formAction}
      noValidate
      className="flex flex-col gap-5"
      key={JSON.stringify(state.values ?? null)}
    >
      <input type="hidden" name="mode" value={editing ? "edit" : "create"} />
      <FormMessage status={state.status} message={state.message} />
      <div className="grid gap-5 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_8rem]">
        <Field id={`${prefix}-title`} label="Title" error={errors.title}>
          <input
            id={`${prefix}-title`}
            name="title"
            required
            maxLength={60}
            defaultValue={state.values?.title ?? category?.title}
            aria-invalid={errors.title ? true : undefined}
            className="input-base"
          />
        </Field>
        <Field
          id={`${prefix}-slug`}
          label="URL slug"
          error={errors.slug}
          hint={editing ? "Fixed after creation." : "e.g. knitwear → /collections/knitwear"}
        >
          <input
            id={`${prefix}-slug`}
            name="slug"
            required
            defaultValue={state.values?.slug ?? category?.slug}
            readOnly={editing}
            aria-invalid={errors.slug ? true : undefined}
            className="input-base read-only:bg-surface read-only:text-ink-muted"
          />
        </Field>
        <Field id={`${prefix}-order`} label="Order" error={errors.sortOrder}>
          <input
            id={`${prefix}-order`}
            name="sortOrder"
            type="number"
            min={0}
            step={1}
            defaultValue={state.values?.sortOrder ?? category?.sortOrder}
            placeholder="Last"
            className="input-base"
          />
        </Field>
      </div>
      <ImageListField
        name="image"
        label="Tile image"
        initial={parseImages(state.values?.image) ?? (category?.image ? [category.image] : [])}
        max={1}
        error={errors.image}
        hint="Categories without an image are hidden from the homepage category grid."
      />
      <div>
        <button type="submit" className="btn btn-primary" disabled={pending}>
          {pending ? "Saving…" : editing ? "Save category" : "Create category"}
        </button>
      </div>
    </form>
  );
}
