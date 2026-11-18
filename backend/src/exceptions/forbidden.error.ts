import { AppError } from "./app-error";

/** 403: the caller is authenticated but not allowed to do this. */
export class ForbiddenError extends AppError {
  constructor(message = "You do not have permission to perform this action") {
    super(403, "FORBIDDEN", message);
  }
}
