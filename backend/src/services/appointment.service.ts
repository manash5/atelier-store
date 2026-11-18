import type { CreateAppointmentBody } from "../dtos/appointment.dto";
import { NotFoundError } from "../exceptions";
import type { AppointmentRequest, AppointmentStatus } from "../models/appointment";
import { type AppointmentFilter, appointmentRepository } from "../repositories/appointment.repository";
import type { Page } from "../types/pagination";

export const appointmentService = {
  /** Stores a booking request; `userId` links it to the signed-in customer, if any. */
  async request(body: CreateAppointmentBody, userId?: string): Promise<AppointmentRequest> {
    return appointmentRepository.insert({
      name: body.name,
      email: body.email.toLowerCase(),
      phone: body.phone,
      type: body.type,
      preferredDate: body.preferredDate ?? null,
      note: body.note ?? null,
      userId: userId ?? null,
    });
  },

  async list(params: AppointmentFilter & { page: number; limit: number }): Promise<Page<AppointmentRequest>> {
    const { page, limit, ...filter } = params;
    const [items, total] = await Promise.all([
      appointmentRepository.findPage((page - 1) * limit, limit, filter),
      appointmentRepository.count(filter),
    ]);
    return { items, meta: { page, limit, total } };
  },

  async setStatus(id: number, status: AppointmentStatus): Promise<AppointmentRequest> {
    const updated = await appointmentRepository.setStatus(id, status);
    if (!updated) throw new NotFoundError("Appointment request not found");
    return updated;
  },

  async countNew(): Promise<number> {
    return appointmentRepository.count({ status: "new" });
  },
};
