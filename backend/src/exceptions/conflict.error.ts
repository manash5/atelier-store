import { AppError } from "./app-error";

/** 409: the request is valid but conflicts with current state (e.g. stock ran out). */
export class ConflictError extends AppError {
  constructor(message: string, details?: unknown) {
    super(409, "CONFLICT", message, details);
  }
}
