import type { Request, Response } from "express";

import {
  AdminAppointmentListQuery,
  AppointmentParams,
  CreateAppointmentBody,
  toAppointmentDto,
  toAppointmentReceiptDto,
  UpdateAppointmentStatusBody,
} from "../dtos/appointment.dto";
import { validated } from "../middleware/validate";
import { appointmentService } from "../services/appointment.service";
import { sendCreated, sendOk } from "../utils/http-response";

export const appointmentController = {
  /** Public; `optionalAuthorize` sets `req.user` for signed-in customers. */
  async create(req: Request, res: Response) {
    const body = validated(req, "body", CreateAppointmentBody);
    const request = await appointmentService.request(body, req.user?.sub);
    sendCreated(res, toAppointmentReceiptDto(request));
  },
};

// Admin only (mounted on adminRouter).
export const adminAppointmentController = {
  async list(req: Request, res: Response) {
    const { page, limit, status, q } = validated(req, "query", AdminAppointmentListQuery);
    const result = await appointmentService.list({ page, limit, status, search: q });
    sendOk(res, result.items.map(toAppointmentDto), result.meta);
  },

  async setStatus(req: Request, res: Response) {
    const { id } = validated(req, "params", AppointmentParams);
    const { status } = validated(req, "body", UpdateAppointmentStatusBody);
    sendOk(res, toAppointmentDto(await appointmentService.setStatus(id, status)));
  },
};
