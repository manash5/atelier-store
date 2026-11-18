"use client";

import { useActionState, useRef } from "react";

import { removeItemAction, updateQuantityAction } from "../actions";
import type { CartLineState } from "../types";

const initialState: CartLineState = {};

type CartLineControlsProps = {
  slug: string;
  name: string;
  quantity: number;
  /** Highest quantity available right now (0 when sold out). */
  maxQuantity: number;
};

/** Quantity picker (submits on change) and remove button for one bag line. */
export function CartLineControls({ slug, name, quantity, maxQuantity }: CartLineControlsProps) {
  const [updateState, updateAction, updating] = useActionState(updateQuantityAction, initialState);
  const [removeState, removeAction, removing] = useActionState(removeItemAction, initialState);
  const quantityForm = useRef<HTMLFormElement>(null);

  // Keep the current quantity selectable even if stock has dropped below it,
  // so the picker shows the truth; the line's issue explains what to change.
  const options = Array.from({ length: Math.max(maxQuantity, quantity) }, (_, index) => index + 1);
  const error = updateState.error ?? removeState.error;
  const busy = updating || removing;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-6">
        {maxQuantity > 0 ? (
          <form ref={quantityForm} action={updateAction} className="flex items-center gap-3">
            <input type="hidden" name="slug" value={slug} />
            <label htmlFor={`quantity-${slug}`} className="type-label text-ink-muted">
              Qty
            </label>
            <select
              id={`quantity-${slug}`}
              name="quantity"
              defaultValue={quantity}
              key={quantity}
              disabled={busy}
              onChange={() => quantityForm.current?.requestSubmit()}
              className="input-base min-h-10 w-20 pr-2 pl-3"
            >
              {options.map((option) => (
                <option key={option} value={option} disabled={option > maxQuantity}>
                  {option}
                </option>
              ))}
            </select>
            <noscript>
              <button type="submit" className="btn btn-secondary btn-sm">
                Update
              </button>
            </noscript>
          </form>
        ) : null}

        <form action={removeAction}>
          <input type="hidden" name="slug" value={slug} />
          <button
            type="submit"
            disabled={busy}
            aria-label={`Remove ${name} from your bag`}
            className="type-label text-ink-muted link-muted disabled:opacity-50"
          >
            {removing ? "Removing…" : "Remove"}
          </button>
        </form>
      </div>

      {error ? (
        <p role="alert" className="type-caption text-sale">
          {error}
        </p>
      ) : null}
    </div>
  );
}
