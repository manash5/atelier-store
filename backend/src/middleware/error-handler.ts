import type { ApiErrorBody } from "../dtos/common.dto";
import type { ErrorRequestHandler } from "express";

import { isProduction } from "../config/env";
import { AppError } from "../exceptions";
import { toUploadError } from "./upload.middleware";

/** Body-parser and similar errors carry an HTTP status of their own. */
function clientStatus(error: unknown): number | undefined {
  if (typeof error === "object" && error !== null && "status" in error) {
    const status = Number((error as { status: unknown }).status);
    if (status >= 400 && status < 500) return status;
  }
  return undefined;
}

/**
 * Development-only description of an unexpected error. Wrapper errors (e.g.
 * Drizzle's "Failed query: <sql>") hide the real reason in `cause`, so report
 * the innermost cause, such as `relation "products" does not exist`.
 */
function describe(error: unknown): string {
  let current: unknown = error;
  while (current instanceof Error && current.cause instanceof Error) {
    current = current.cause;
  }
  if (current === error) {
    return error instanceof Error ? error.message : String(error);
  }
  const outer = error instanceof Error ? error.name : "Error";
  return `${outer}: ${(current as Error).message}`;
}

export const errorHandler: ErrorRequestHandler = (thrown, req, res, _next) => {
  const error: unknown = toUploadError(thrown) ?? thrown;
  let status: number;
  let body: ApiErrorBody;

  if (error instanceof AppError) {
    status = error.status;
    body = {
      error: {
        code: error.code,
        message: error.message,
        ...(error.details === undefined ? {} : { details: error.details }),
      },
    };
  } else if (clientStatus(error) !== undefined) {
    status = clientStatus(error)!;
    body = { error: { code: "BAD_REQUEST", message: "Malformed request" } };
  } else {
    status = 500;
    body = {
      error: {
        code: "INTERNAL_ERROR",
        message: isProduction ? "Something went wrong" : describe(error),
      },
    };
  }

  if (status >= 500) req.log.error({ err: error }, "Unhandled error");
  else req.log.debug({ err: error }, "Request failed");

  if (res.headersSent) return;
  res.status(status).json(body);
};
