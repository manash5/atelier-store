import { AppError } from "./app-error";

/** 401: the request has no valid credentials. */
export class UnauthorizedError extends AppError {
  constructor(message = "Authentication required") {
    super(401, "UNAUTHORIZED", message);
  }
}
