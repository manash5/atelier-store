"use client";

import Link from "next/link";
import { useActionState } from "react";

import { addToBagAction } from "../actions";
import type { AddToBagState } from "../types";

const initialState: AddToBagState = { status: "idle" };

/**
 * Adds one unit to the signed-in visitor's bag. Guests are sent to sign in
 * and come back to this product afterwards.
 */
export function AddToBagButton({ slug }: { slug: string }) {
  const [state, formAction, pending] = useActionState(addToBagAction, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <input type="hidden" name="slug" value={slug} />
      <button type="submit" className="btn btn-primary w-full" disabled={pending}>
        {pending ? "Adding…" : "Add to bag"}
      </button>

      <div aria-live="polite" className="min-h-0">
        {state.status === "added" ? (
          <p className="flex items-center justify-between gap-4 border px-4 py-3 type-body">
            <span className="flex items-center gap-2.5">
              <span aria-hidden="true" className="size-2 shrink-0 rounded-full bg-success" />
              {state.message}
            </span>
            <Link href="/bag" className="shrink-0 type-label link">
              View bag
            </Link>
          </p>
        ) : state.status === "error" ? (
          <p role="alert" className="border border-sale px-4 py-3 type-body text-sale">
            {state.message}
          </p>
        ) : null}
      </div>
    </form>
  );
}
