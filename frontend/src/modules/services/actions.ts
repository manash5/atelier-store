"use server";

import { headers } from "next/headers";

import { isApiError } from "@/shared/api/errors";

import { requestAppointment } from "./api/appointments.service";
import { validateAppointment } from "./lib/appointment-validation";
import type { AppointmentField, AppointmentFormState } from "./types";

const FIELDS: AppointmentField[] = ["name", "email", "phone", "type", "preferredDate", "note"];

/** Public: guests can book. Signed-in customers are linked by their token. */
export async function requestAppointmentAction(
  _previous: AppointmentFormState,
  formData: FormData,
): Promise<AppointmentFormState> {
  const result = validateAppointment(formData);
  if (!result.ok) return { fieldErrors: result.fieldErrors, values: result.values };

  const forwardedFor = (await headers()).get("x-forwarded-for") ?? undefined;
  try {
    const receipt = await requestAppointment(result.input, forwardedFor);
    return { receipt: { ...receipt, name: result.input.name, email: result.input.email } };
  } catch (error) {
    if (!isApiError(error)) throw error;
    if (error.status === 429) {
      return {
        error: "We've received several requests from you already. Please try again in a few minutes, or call us.",
        values: result.values,
      };
    }
    if (error.status === 0) {
      return { error: "We can't reach our booking system right now. Please try again.", values: result.values };
    }
    // Map API validation details onto the form fields.
    const fieldErrors: AppointmentFormState["fieldErrors"] = {};
    if (Array.isArray(error.details)) {
      for (const detail of error.details as { path?: unknown; message?: unknown }[]) {
        const field = typeof detail.path === "string" ? detail.path.split(".")[0] : undefined;
        if (field && FIELDS.includes(field as AppointmentField) && typeof detail.message === "string") {
          fieldErrors[field as AppointmentField] ??= detail.message;
        }
      }
    }
    return {
      error: Object.keys(fieldErrors).length ? "Check the highlighted fields." : error.message,
      fieldErrors,
      values: result.values,
    };
  }
}
