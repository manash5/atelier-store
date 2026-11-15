import type { ApiErrorBody, ErrorCode } from "@/shared/types/api";
import { isAxiosError } from "axios";

/** Normalized failure from the backend API (or the network). */
export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: ErrorCode | "NETWORK_ERROR",
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

function isErrorBody(value: unknown): value is ApiErrorBody {
  return (
    typeof value === "object" &&
    value !== null &&
    "error" in value &&
    typeof (value as ApiErrorBody).error?.code === "string"
  );
}

/** Axios response interceptor: rejects with an ApiError instead of an AxiosError. */
export function toApiError(error: unknown): Promise<never> {
  if (isAxiosError(error)) {
    const { response } = error;
    if (!response) {
      const target = `${error.config?.baseURL ?? ""}${error.config?.url ?? ""}`;
      return Promise.reject(
        new ApiError(0, "NETWORK_ERROR", `API unreachable (${target}): ${error.message}`),
      );
    }
    if (isErrorBody(response.data)) {
      const { code, message } = response.data.error;
      return Promise.reject(new ApiError(response.status, code, message));
    }
    return Promise.reject(
      new ApiError(response.status, "INTERNAL_ERROR", `API request failed (${response.status})`),
    );
  }
  return Promise.reject(error);
}

export function isApiError(error: unknown, status?: number): error is ApiError {
  return error instanceof ApiError && (status === undefined || error.status === status);
}
