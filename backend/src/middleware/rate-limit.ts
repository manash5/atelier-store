import type { ApiErrorBody } from "../dtos/common.dto";
import { rateLimit } from "express-rate-limit";

const body: ApiErrorBody = {
  error: { code: "RATE_LIMITED", message: "Too many requests, please try again later" },
};

/** Spam protection for the public appointment form: 5 requests per IP per 15 minutes. */
export const appointmentRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  handler: (_req, res) => {
    res.status(429).json(body);
  },
});

/** Brute-force protection for sign-in/sign-up endpoints. */
export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  handler: (_req, res) => {
    res.status(429).json(body);
  },
});
