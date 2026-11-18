import { date, index, integer, pgEnum, pgTable, text, timestamp } from "drizzle-orm/pg-core";

import { user } from "./auth";

// Client services (ADR-017). Appointment requests come from the public
// booking form; client advisors follow up and mark them contacted in the
// admin portal.

export const appointmentType = pgEnum("appointment_type", ["in_store", "video"]);
export const appointmentStatus = pgEnum("appointment_status", ["new", "contacted"]);

export const appointmentRequests = pgTable(
  "appointment_requests",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    name: text("name").notNull(),
    email: text("email").notNull(),
    phone: text("phone").notNull(),
    type: appointmentType("type").notNull().default("in_store"),
    /** The day the client would like, if they gave one (YYYY-MM-DD). */
    preferredDate: date("preferred_date", { mode: "string" }),
    note: text("note"),
    status: appointmentStatus("status").notNull().default("new"),
    /** Set when a signed-in customer booked; kept if the account is deleted. */
    userId: text("user_id").references(() => user.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("appointment_requests_created_at_idx").on(table.createdAt.desc(), table.id.desc()),
  ],
);
