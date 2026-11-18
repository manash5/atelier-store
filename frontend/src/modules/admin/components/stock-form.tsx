"use client";

import { useActionState } from "react";

import { setStockAction } from "../actions";
import type { FormState } from "../types";
import { FormMessage } from "./ui";

const initialState: FormState = {};

/**
 * Sets an exact stock level. The value the admin saw is sent along, so an
 * order placed meanwhile isn't silently overwritten (the API answers 409 and
 * the page reloads with the current number).
 */
export function StockForm({ slug, stock }: { slug: string; stock: number }) {
  const [state, formAction, pending] = useActionState(setStockAction, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4" key={stock}>
      <input type="hidden" name="slug" value={slug} />
      <input type="hidden" name="expectedStock" value={stock} />
      <FormMessage status={state.status} message={state.message} />
      <div className="flex flex-col gap-2">
        <label htmlFor="stock-input" className="type-label">
          Units in stock
        </label>
        <div className="flex gap-2">
          <input
            id="stock-input"
            name="stock"
            type="number"
            min={0}
            step={1}
            required
            defaultValue={stock}
            aria-invalid={state.fieldErrors?.stock ? true : undefined}
            className="input-base min-w-0 flex-1"
          />
          <button type="submit" className="btn btn-primary shrink-0" disabled={pending}>
            {pending ? "Saving…" : "Set stock"}
          </button>
        </div>
        {state.fieldErrors?.stock ? (
          <p className="type-caption text-sale">{state.fieldErrors.stock}</p>
        ) : (
          <p className="type-caption text-ink-muted">3 or fewer shows as low stock; 0 is sold out.</p>
        )}
      </div>
    </form>
  );
}
