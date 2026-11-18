import { Router } from "express";

import { appointmentController } from "../controllers/appointment.controller";
import { CreateAppointmentBody } from "../dtos/appointment.dto";
import { optionalAuthorize } from "../middleware/auth.middleware";
import { appointmentRateLimit } from "../middleware/rate-limit";
import { validate } from "../middleware/validate";

/** Public booking requests (guests welcome; rate-limited per IP). */
export const appointmentRouter = Router();

appointmentRouter.post(
  "/",
  appointmentRateLimit,
  optionalAuthorize,
  validate({ body: CreateAppointmentBody }),
  appointmentController.create,
);
