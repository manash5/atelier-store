"use client";

import { useActionState } from "react";

import { setAppointmentStatusAction } from "../actions";
import type { AppointmentStatus, FormState } from "../types";

const initialState: FormState = {};

/** Toggles a request between new and contacted. */
export function AppointmentStatusButton({ id, status }: { id: number; status: AppointmentStatus }) {
  const [state, formAction, pending] = useActionState(setAppointmentStatusAction, initialState);
  const next: AppointmentStatus = status === "new" ? "contacted" : "new";

  return (
    <form action={formAction} className="flex flex-col items-end gap-1">
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="status" value={next} />
      <button
        type="submit"
        disabled={pending}
        className={`btn btn-sm ${status === "new" ? "btn-primary" : "btn-ghost"}`}
      >
        {pending ? "Saving…" : status === "new" ? "Mark contacted" : "Reopen"}
      </button>
      {state.status === "error" && state.message ? (
        <p role="alert" className="max-w-48 text-right type-caption text-sale">
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
