import "server-only";

import { isApiError } from "@/shared/api/errors";
import { authedServerApi } from "@/shared/api/server-client";
import type { ApiSuccess } from "@/shared/types/api";

import type { Me, Upload } from "../types";

/**
 * The signed-in user from GET /api/v1/me, or null when the visitor has no
 * valid access token. Request-specific: render inside <Suspense>.
 */
export async function getMe(): Promise<Me | null> {
  const api = await authedServerApi();
  try {
    const { data } = await api.get<ApiSuccess<Me>>("/me");
    return data.data;
  } catch (error) {
    if (isApiError(error, 401)) return null;
    throw error;
  }
}

/** POST /api/v1/admin/uploads (admin token required). */
export async function uploadAdminImage(file: File): Promise<Upload> {
  const api = await authedServerApi();
  const form = new FormData();
  form.append("image", file, file.name);
  const { data } = await api.post<ApiSuccess<Upload>>("/admin/uploads", form);
  return data.data;
}
