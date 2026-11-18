"use client";

import { useActionState } from "react";

import { updateOrderStatusAction } from "../actions";
import type { FormState, OrderStatus } from "../types";
import { FormMessage, ORDER_LABEL } from "./ui";

const initialState: FormState = {};

const VERB: Record<OrderStatus, string> = {
  paid: "Mark paid",
  processing: "Start processing",
  shipped: "Mark shipped",
  delivered: "Mark delivered",
  cancelled: "Cancel order",
};

/** One button per allowed next status; cancelling asks for confirmation. */
export function OrderStatusForm({ number, nextStatuses }: { number: string; nextStatuses: OrderStatus[] }) {
  const [state, formAction, pending] = useActionState(updateOrderStatusAction, initialState);

  return (
    <div className="flex flex-col gap-4">
      <FormMessage status={state.status} message={state.message} />
      {nextStatuses.length === 0 ? (
        <p className="type-body text-ink-muted">This order is final; its status can&apos;t change.</p>
      ) : (
        <form action={formAction} className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <input type="hidden" name="number" value={number} />
          {nextStatuses.map((status) => (
            <button
              key={status}
              type="submit"
              name="status"
              value={status}
              disabled={pending}
              onClick={(event) => {
                if (
                  status === "cancelled" &&
                  !window.confirm(`Cancel order ${number}? Its items go back into stock. This can't be undone.`)
                ) {
                  event.preventDefault();
                }
              }}
              className={`btn ${status === "cancelled" ? "btn-secondary" : "btn-primary"}`}
              aria-label={`${VERB[status]} (${ORDER_LABEL[status]})`}
            >
              {pending ? "Saving…" : VERB[status]}
            </button>
          ))}
        </form>
      )}
    </div>
  );
}
