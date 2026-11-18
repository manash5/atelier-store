import type { appointmentRequests } from "../database/schema";

export type AppointmentRequest = typeof appointmentRequests.$inferSelect;
export type NewAppointmentRequest = typeof appointmentRequests.$inferInsert;
export type AppointmentStatus = AppointmentRequest["status"];
export type AppointmentType = AppointmentRequest["type"];

/** How far ahead a client can ask for a date. */
export const MAX_DAYS_AHEAD = 365;
