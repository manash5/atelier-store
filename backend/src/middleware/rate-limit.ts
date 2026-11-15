import type { ApiErrorBody } from "../dtos/common.dto";
import { rateLimit } from "express-rate-limit";

const body: ApiErrorBody = {
  error: { code: "RATE_LIMITED", message: "Too many requests, please try again later" },
};

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
