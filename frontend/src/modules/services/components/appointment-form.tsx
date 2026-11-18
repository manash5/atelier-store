"use client";

import Link from "next/link";
import { useActionState, type ReactNode } from "react";

import { requestAppointmentAction } from "../actions";
import { appointmentTypes } from "../content";
import type { AppointmentField, AppointmentFormState } from "../types";

const initialState: AppointmentFormState = {};

const longDate = new Intl.DateTimeFormat("en-US", { dateStyle: "full", timeZone: "UTC" });

type AppointmentFormProps = {
  /** Name and email of a signed-in customer. */
  prefill?: { name?: string; email?: string };
  /** Earliest and latest selectable dates (YYYY-MM-DD), computed per request. */
  minDate?: string;
  maxDate?: string;
};

function Field({
  id,
  label,
  error,
  hint,
  optional,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  optional?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="type-label">
        {label}
        {optional ? <span className="ml-2 text-ink-subtle normal-case">(optional)</span> : null}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} className="type-caption text-sale">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="type-caption text-ink-muted">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

export function AppointmentForm({ prefill, minDate, maxDate }: AppointmentFormProps) {
  const [state, formAction, pending] = useActionState(requestAppointmentAction, initialState);

  if (state.receipt) {
    const { receipt } = state;
    return (
      <div role="status" className="flex flex-col items-start gap-5 bg-surface px-6 py-10 lg:px-10">
        <span aria-hidden="true" className="flex size-11 items-center justify-center rounded-full bg-success text-canvas">
          <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="m5 12.5 4.5 4.5L19 7.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
        <h2 className="type-heading">Thank you, {receipt.name.split(" ")[0]}</h2>
        <p className="type-body-lg text-ink-muted">
          We&apos;ve received your request for {receipt.type === "video" ? "a video call" : "an in-store appointment"}
          {receipt.preferredDate ? ` on ${longDate.format(new Date(receipt.preferredDate))}` : ""}. A client
          advisor will contact you at {receipt.email} or by phone within one business day.
        </p>
        <p className="type-caption text-ink-muted">Reference A-{String(receipt.id).padStart(5, "0")}</p>
        <Link href="/collections/new-in" className="mt-2 btn btn-primary">
          Explore new arrivals
        </Link>
      </div>
    );
  }

  const errors = state.fieldErrors ?? {};
  const value = (field: AppointmentField, fallback = "") => state.values?.[field] ?? fallback;
  const describedBy = (field: AppointmentField) => (errors[field] ? `appointment-${field}-error` : undefined);
  const type = value("type", "in_store");

  return (
    // Re-mount after a failed submit so the fields show what was typed.
    <form action={formAction} noValidate className="flex flex-col gap-8" key={JSON.stringify(state.values ?? null)}>
      {state.error ? (
        <p role="alert" className="border border-sale px-4 py-3 type-body text-sale">
          {state.error}
        </p>
      ) : null}

      <fieldset className="flex flex-col gap-3">
        <legend className="mb-3 type-label">How would you like to meet?</legend>
        <div className="grid gap-3 sm:grid-cols-2">
          {appointmentTypes.map((option) => (
            <label
              key={option.value}
              className="flex cursor-pointer gap-3 border border-line-strong px-4 py-4 has-checked:border-ink has-checked:bg-surface"
            >
              <input
                type="radio"
                name="type"
                value={option.value}
                defaultChecked={type === option.value}
                className="mt-1 accent-ink"
              />
              <span>
                <span className="block type-body">{option.label}</span>
                <span className="block type-caption text-ink-muted">{option.description}</span>
              </span>
            </label>
          ))}
        </div>
        {errors.type ? <p className="type-caption text-sale">{errors.type}</p> : null}
      </fieldset>

      <Field id="appointment-name" label="Full name" error={errors.name}>
        <input
          id="appointment-name"
          name="name"
          autoComplete="name"
          required
          maxLength={100}
          defaultValue={value("name", prefill?.name)}
          aria-invalid={errors.name ? true : undefined}
          aria-describedby={describedBy("name")}
          className="input-base"
        />
      </Field>

      <div className="grid gap-8 sm:grid-cols-2">
        <Field id="appointment-email" label="Email" error={errors.email}>
          <input
            id="appointment-email"
            name="email"
            type="email"
            autoComplete="email"
            required
            defaultValue={value("email", prefill?.email)}
            aria-invalid={errors.email ? true : undefined}
            aria-describedby={describedBy("email")}
            className="input-base"
          />
        </Field>
        <Field id="appointment-phone" label="Phone number" error={errors.phone}>
          <input
            id="appointment-phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            required
            placeholder="+1 212 555 0100"
            defaultValue={value("phone")}
            aria-invalid={errors.phone ? true : undefined}
            aria-describedby={describedBy("phone")}
            className="input-base"
          />
        </Field>
      </div>

      <Field
        id="appointment-date"
        label="Preferred date"
        optional
        error={errors.preferredDate}
        hint="We'll confirm the exact time with you."
      >
        <input
          id="appointment-date"
          name="preferredDate"
          type="date"
          min={minDate}
          max={maxDate}
          defaultValue={value("preferredDate")}
          aria-invalid={errors.preferredDate ? true : undefined}
          aria-describedby={errors.preferredDate ? "appointment-preferredDate-error" : "appointment-date-hint"}
          className="input-base sm:w-64"
        />
      </Field>

      <Field
        id="appointment-note"
        label="What are you looking for?"
        optional
        error={errors.note}
        hint="An occasion, sizes, pieces you'd like to try…"
      >
        <textarea
          id="appointment-note"
          name="note"
          rows={4}
          maxLength={1000}
          defaultValue={value("note")}
          aria-invalid={errors.note ? true : undefined}
          className="input-base py-3"
        />
      </Field>

      <div className="flex flex-col gap-3">
        <button type="submit" className="btn btn-primary btn-lg w-full sm:w-auto sm:self-start" disabled={pending}>
          {pending ? "Sending…" : "Request appointment"}
        </button>
        <p className="type-caption text-ink-muted">
          We only use your details to arrange this appointment.
        </p>
      </div>
    </form>
  );
}
