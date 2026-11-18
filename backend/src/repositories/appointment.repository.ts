import { and, desc, eq, ilike, or, type SQL } from "drizzle-orm";

import { db } from "../database";
import { appointmentRequests } from "../database/schema";
import type {
  AppointmentRequest,
  AppointmentStatus,
  NewAppointmentRequest,
} from "../models/appointment";

export type AppointmentFilter = {
  status?: AppointmentStatus | undefined;
  /** Partial match on name, email or phone. */
  search?: string | undefined;
};

function escapeLike(value: string): string {
  return value.replace(/[\\%_]/g, (char) => `\\${char}`);
}

function filterWhere({ status, search }: AppointmentFilter): SQL | undefined {
  const pattern = search ? `%${escapeLike(search)}%` : undefined;
  return and(
    status ? eq(appointmentRequests.status, status) : undefined,
    pattern
      ? or(
          ilike(appointmentRequests.name, pattern),
          ilike(appointmentRequests.email, pattern),
          ilike(appointmentRequests.phone, pattern),
        )
      : undefined,
  );
}

export const appointmentRepository = {
  async insert(values: NewAppointmentRequest): Promise<AppointmentRequest> {
    const [row] = await db.insert(appointmentRequests).values(values).returning();
    if (!row) throw new Error("Appointment insert returned no row");
    return row;
  },

  /** Newest first. */
  async findPage(offset: number, limit: number, filter: AppointmentFilter): Promise<AppointmentRequest[]> {
    return db
      .select()
      .from(appointmentRequests)
      .where(filterWhere(filter))
      .orderBy(desc(appointmentRequests.createdAt), desc(appointmentRequests.id))
      .offset(offset)
      .limit(limit);
  },

  async count(filter: AppointmentFilter): Promise<number> {
    return db.$count(appointmentRequests, filterWhere(filter));
  },

  /** The updated row, or null if it doesn't exist. */
  async setStatus(id: number, status: AppointmentStatus): Promise<AppointmentRequest | null> {
    const [row] = await db
      .update(appointmentRequests)
      .set({ status })
      .where(eq(appointmentRequests.id, id))
      .returning();
    return row ?? null;
  },
};
