"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useActionState } from "react";

import { signUpAction } from "../actions";
import type { AuthFormState } from "../types";
import { FormAlert } from "./form-alert";
import { FormField } from "./form-field";

const initialState: AuthFormState = {};

export function SignUpForm() {
  const next = useSearchParams().get("next") ?? "";
  const [state, formAction, pending] = useActionState(signUpAction, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-6" noValidate>
      <input type="hidden" name="next" value={next} />
      <FormAlert message={state.error} />
      <FormField
        name="name"
        label="Full name"
        autoComplete="name"
        required
        defaultValue={state.values?.name}
        error={state.fieldErrors?.name}
      />
      <FormField
        name="email"
        label="Email"
        type="email"
        autoComplete="email"
        required
        defaultValue={state.values?.email}
        error={state.fieldErrors?.email}
      />
      <FormField
        name="password"
        label="Password"
        type="password"
        autoComplete="new-password"
        required
        minLength={8}
        maxLength={128}
        hint="At least 8 characters."
        error={state.fieldErrors?.password}
      />
      <button type="submit" className="btn btn-primary w-full" disabled={pending}>
        {pending ? "Creating account…" : "Create account"}
      </button>
      <p className="text-center type-body text-ink-muted">
        Already have an account?{" "}
        <Link
          href={next ? `/sign-in?next=${encodeURIComponent(next)}` : "/sign-in"}
          className="link text-ink"
        >
          Sign in
        </Link>
      </p>
    </form>
  );
}
