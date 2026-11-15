import type { z } from "zod";

import { AppError } from "./app-error";

export class ValidationError extends AppError {
  constructor(error: z.ZodError) {
    super(
      400,
      "VALIDATION_ERROR",
      "Request validation failed",
      error.issues.map((issue) => ({
        path: issue.path.join("."),
        message: issue.message,
      })),
    );
  }
}
