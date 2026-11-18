"use client";

import Link from "next/link";
import { useActionState, type InputHTMLAttributes } from "react";

import { placeOrderAction } from "../actions";
import type { CheckoutField, CheckoutState } from "../types";

const initialState: CheckoutState = {};

type FieldProps = InputHTMLAttributes<HTMLInputElement> & {
  name: CheckoutField;
  label: string;
  state: CheckoutState;
  optional?: boolean;
  className?: string;
};

function Field({ name, label, state, optional, className, ...input }: FieldProps) {
  const id = `checkout-${name}`;
  const error = state.fieldErrors?.[name];
  return (
    <div className={`flex flex-col gap-2 ${className ?? ""}`}>
      <label htmlFor={id} className="type-label">
        {label}
        {optional ? <span className="ml-2 text-ink-subtle normal-case">(optional)</span> : null}
      </label>
      <input
        id={id}
        name={name}
        className="input-base"
        defaultValue={state.values?.[name]}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        required={!optional}
        {...input}
      />
      {error ? (
        <p id={`${id}-error`} className="type-caption text-sale">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function StepHeading({ step, title }: { step: number; title: string }) {
  return (
    <h2 className="flex items-baseline gap-4 border-b pb-4 type-title">
      <span className="type-label text-ink-muted">{String(step).padStart(2, "0")}</span>
      {title}
    </h2>
  );
}

export function CheckoutForm({ totalLabel }: { totalLabel: string }) {
  const [state, formAction, pending] = useActionState(placeOrderAction, initialState);
  // Re-mount fields after each failed submit so defaultValue picks up echoed values.
  const key = JSON.stringify(state.values ?? {});

  return (
    <form action={formAction} noValidate className="flex flex-col gap-12" key={key}>
      {state.error ? (
        <div role="alert" className="flex flex-col gap-3 border border-sale px-4 py-4 type-body text-sale sm:flex-row sm:items-center sm:justify-between">
          <p>{state.error}</p>
          <Link href="/bag" className="shrink-0 type-label link">
            Review bag
          </Link>
        </div>
      ) : null}

      <fieldset className="flex flex-col gap-6">
        <legend className="contents">
          <StepHeading step={1} title="Shipping address" />
        </legend>
        <Field name="fullName" label="Full name" autoComplete="name" state={state} />
        <Field name="line1" label="Address" autoComplete="address-line1" state={state} />
        <Field
          name="line2"
          label="Apartment, suite, etc."
          autoComplete="address-line2"
          optional
          state={state}
        />
        <div className="grid gap-6 sm:grid-cols-2">
          <Field name="city" label="City" autoComplete="address-level2" state={state} />
          <Field name="postalCode" label="Postal code" autoComplete="postal-code" state={state} />
        </div>
        <div className="grid gap-6 sm:grid-cols-2">
          <Field name="country" label="Country" autoComplete="country-name" state={state} />
          <Field name="phone" label="Phone" type="tel" autoComplete="tel" optional state={state} />
        </div>
      </fieldset>

      <fieldset className="flex flex-col gap-6">
        <legend className="contents">
          <StepHeading step={2} title="Payment" />
        </legend>
        <p className="flex gap-3 bg-surface px-4 py-4 type-caption text-ink-muted">
          <span aria-hidden="true" className="mt-1 size-2 shrink-0 rounded-full bg-ink-subtle" />
          <span>
            <strong className="font-medium text-ink">Demo checkout.</strong> No payment is taken and
            card details never leave this page&apos;s server: only the last four digits are kept
            for your receipt. Use 4242 4242 4242 4242, any future date and any CVC.
          </span>
        </p>
        <Field name="cardName" label="Name on card" autoComplete="cc-name" state={state} />
        <Field
          name="cardNumber"
          label="Card number"
          inputMode="numeric"
          autoComplete="cc-number"
          placeholder="1234 1234 1234 1234"
          maxLength={23}
          state={state}
        />
        <div className="grid grid-cols-2 gap-6">
          <Field
            name="cardExpiry"
            label="Expiry (MM/YY)"
            inputMode="numeric"
            autoComplete="cc-exp"
            placeholder="MM/YY"
            maxLength={7}
            state={state}
          />
          <Field
            name="cardCvc"
            label="Security code"
            inputMode="numeric"
            autoComplete="cc-csc"
            placeholder="CVC"
            maxLength={4}
            state={state}
          />
        </div>
      </fieldset>

      <div className="flex flex-col gap-3">
        <button type="submit" className="btn btn-primary btn-lg w-full" disabled={pending}>
          {pending ? "Placing order…" : `Pay ${totalLabel}`}
        </button>
        <p className="text-center type-caption text-ink-muted">
          By placing your order you agree to our terms of sale.
        </p>
      </div>
    </form>
  );
}
