"use client";

import { useActionState } from "react";

import { setUserRoleAction } from "../actions";
import type { AdminUser, FormState } from "../types";

const initialState: FormState = {};

/** Promote to admin, or remove admin access (with confirmation). */
export function RoleButton({ user, isSelf }: { user: AdminUser; isSelf: boolean }) {
  const [state, formAction, pending] = useActionState(setUserRoleAction, initialState);
  const makeAdmin = user.role !== "admin";

  return (
    <form action={formAction} className="flex flex-col items-end gap-1">
      <input type="hidden" name="id" value={user.id} />
      <input type="hidden" name="role" value={makeAdmin ? "admin" : "user"} />
      {isSelf ? (
        <span className="type-caption text-ink-muted">You</span>
      ) : (
        <button
          type="submit"
          disabled={pending || (makeAdmin && user.banned)}
          onClick={(event) => {
            const question = makeAdmin
              ? `Give ${user.name} (${user.email}) full admin access?`
              : `Remove admin access from ${user.name}? It takes effect on their next request.`;
            if (!window.confirm(question)) event.preventDefault();
          }}
          className={`btn btn-sm ${makeAdmin ? "btn-secondary" : "btn-ghost"}`}
        >
          {pending ? "Saving…" : makeAdmin ? "Make admin" : "Remove admin"}
        </button>
      )}
      {state.message ? (
        <p role={state.status === "error" ? "alert" : "status"} className={`max-w-56 text-right type-caption ${state.status === "error" ? "text-sale" : "text-ink-muted"}`}>
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
