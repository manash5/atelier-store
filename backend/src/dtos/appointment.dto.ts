import { z } from "zod";

import { type AppointmentRequest, MAX_DAYS_AHEAD } from "../models/appointment";

/* --------------------------------------------------------------------------
   Shared shapes
   -------------------------------------------------------------------------- */

export const AppointmentType = z.enum(["in_store", "video"]);
export const AppointmentStatus = z.enum(["new", "contacted"]);

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

function isoDay(offsetDays: number): string {
  const day = new Date();
  day.setUTCHours(0, 0, 0, 0);
  day.setUTCDate(day.getUTCDate() + offsetDays);
  return day.toISOString().slice(0, 10);
}

/* --------------------------------------------------------------------------
   Request shapes
   -------------------------------------------------------------------------- */

export const CreateAppointmentBody = z.object({
  name: z.string().trim().min(1, "Enter your name").max(100),
  email: z.email("Enter a valid email address").max(200),
  phone: z
    .string()
    .trim()
    .regex(/^\+?[\d\s().-]{7,25}$/, "Enter a valid phone number")
    .refine((value) => value.replace(/\D/g, "").length >= 7, "Enter a valid phone number"),
  type: AppointmentType.default("in_store"),
  /** Optional day the client would like, from yesterday (time zones) up to a year ahead. */
  preferredDate: z
    .string()
    .regex(ISO_DATE, "Use YYYY-MM-DD")
    .refine((value) => !Number.isNaN(Date.parse(value)), "Enter a real date")
    .refine((value) => value >= isoDay(-1), "Choose a date from today onwards")
    .refine((value) => value <= isoDay(MAX_DAYS_AHEAD), "Choose a date within the next year")
    .optional(),
  note: z
    .string()
    .trim()
    .max(1000)
    .optional()
    .transform((value) => (value ? value : undefined)),
});
export type CreateAppointmentBody = z.infer<typeof CreateAppointmentBody>;

export const AdminAppointmentListQuery = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(25),
  status: AppointmentStatus.optional(),
  /** Partial name, email or phone. */
  q: z
    .string()
    .trim()
    .max(100)
    .optional()
    .transform((value) => (value ? value : undefined)),
});

export const AppointmentParams = z.object({ id: z.coerce.number().int().positive() });

export const UpdateAppointmentStatusBody = z.object({ status: AppointmentStatus });

/* --------------------------------------------------------------------------
   Response shapes
   -------------------------------------------------------------------------- */

/** What the client gets back: a reference, not their data. */
export const AppointmentReceiptDto = z.object({
  id: z.number().int(),
  type: AppointmentType,
  preferredDate: z.string().nullable(),
  createdAt: z.iso.datetime(),
});
export type AppointmentReceiptDto = z.infer<typeof AppointmentReceiptDto>;

export const AppointmentDto = AppointmentReceiptDto.extend({
  name: z.string(),
  email: z.email(),
  phone: z.string(),
  note: z.string().nullable(),
  status: AppointmentStatus,
  /** True when a signed-in customer booked. */
  hasAccount: z.boolean(),
  updatedAt: z.iso.datetime(),
});
export type AppointmentDto = z.infer<typeof AppointmentDto>;

export function toAppointmentReceiptDto(request: AppointmentRequest): AppointmentReceiptDto {
  return {
    id: request.id,
    type: request.type,
    preferredDate: request.preferredDate,
    createdAt: request.createdAt.toISOString(),
  };
}

export function toAppointmentDto(request: AppointmentRequest): AppointmentDto {
  return {
    ...toAppointmentReceiptDto(request),
    name: request.name,
    email: request.email,
    phone: request.phone,
    note: request.note,
    status: request.status,
    hasAccount: request.userId !== null,
    updatedAt: request.updatedAt.toISOString(),
  };
}
