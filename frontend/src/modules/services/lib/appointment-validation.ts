import type { AppointmentField, AppointmentFormState, AppointmentInput, AppointmentType } from "../types";

// Quick, friendly checks before calling the API, which validates again.

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE = /^\+?[\d\s().-]{7,25}$/;
const DATE = /^\d{4}-\d{2}-\d{2}$/;
const TYPES: AppointmentType[] = ["in_store", "video"];
const FIELDS: AppointmentField[] = ["name", "email", "phone", "type", "preferredDate", "note"];

export type AppointmentValidation =
  | { ok: true; input: AppointmentInput; values: NonNullable<AppointmentFormState["values"]> }
  | {
      ok: false;
      fieldErrors: NonNullable<AppointmentFormState["fieldErrors"]>;
      values: NonNullable<AppointmentFormState["values"]>;
    };

export function validateAppointment(formData: FormData): AppointmentValidation {
  const values: NonNullable<AppointmentFormState["values"]> = {};
  for (const field of FIELDS) {
    const value = formData.get(field);
    values[field] = typeof value === "string" ? value.trim() : "";
  }
  const { name = "", email = "", phone = "", type = "", preferredDate = "", note = "" } = values;

  const fieldErrors: NonNullable<AppointmentFormState["fieldErrors"]> = {};
  if (!name) fieldErrors.name = "Enter your name.";
  else if (name.length > 100) fieldErrors.name = "Use at most 100 characters.";
  if (!EMAIL.test(email)) fieldErrors.email = "Enter a valid email address.";
  if (!PHONE.test(phone) || phone.replace(/\D/g, "").length < 7) {
    fieldErrors.phone = "Enter a phone number we can call, including the country code if outside the US.";
  }
  if (!TYPES.includes(type as AppointmentType)) fieldErrors.type = "Choose in-store or video call.";
  if (preferredDate && !DATE.test(preferredDate)) fieldErrors.preferredDate = "Choose a date.";
  if (note.length > 1000) fieldErrors.note = "Use at most 1000 characters.";

  if (Object.keys(fieldErrors).length > 0) return { ok: false, fieldErrors, values };

  return {
    ok: true,
    values,
    input: {
      name,
      email,
      phone,
      type: type as AppointmentType,
      ...(preferredDate ? { preferredDate } : {}),
      ...(note ? { note } : {}),
    },
  };
}
