import type { ErrorCode } from "../dtos/common.dto";

/** Base class for expected errors. The error handler maps it to an HTTP response. */
export class AppError extends Error {
  constructor(
    readonly status: number,
    readonly code: ErrorCode,
    message: string,
    readonly details?: unknown,
  ) {
    super(message);
    this.name = new.target.name;
  }
}
