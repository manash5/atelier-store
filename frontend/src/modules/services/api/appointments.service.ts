import "server-only";

import { authedServerApi } from "@/shared/api/server-client";
import type { ApiSuccess } from "@/shared/types/api";

import type { AppointmentInput, AppointmentReceipt } from "../types";

/**
 * POST /api/v1/appointments. Sends the visitor's access token when they're
 * signed in (links the request to their account) and their IP, because the
 * API rate-limits per visitor and this call comes from the storefront server.
 */
export async function requestAppointment(
  input: AppointmentInput,
  forwardedFor: string | undefined,
): Promise<AppointmentReceipt> {
  const api = await authedServerApi();
  const { data } = await api.post<ApiSuccess<AppointmentReceipt>>("/appointments", input, {
    headers: forwardedFor ? { "X-Forwarded-For": forwardedFor } : undefined,
  });
  return data.data;
}
