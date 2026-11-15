import "server-only";

import axios from "axios";

import { toApiError } from "./errors";

// Used by Server Components, generateMetadata and generateStaticParams. Calls
// the backend directly on its private URL; never shipped to the browser.
// Wrap calls in `'use cache'` service functions: Axios bypasses Next's fetch
// instrumentation, so caching must always be explicit.
const backendUrl = process.env.BACKEND_URL;
if (!backendUrl) {
  throw new Error("BACKEND_URL is not set (see frontend/CLAUDE.md)");
}

export const serverApi = axios.create({
  baseURL: `${backendUrl.replace(/\/$/, "")}/api/v1`,
  timeout: 10_000,
  headers: { Accept: "application/json" },
});

serverApi.interceptors.response.use(undefined, toApiError);

/** Better Auth endpoints (/api/auth/*), e.g. server-side session lookups. */
export const authApi = axios.create({
  baseURL: `${backendUrl.replace(/\/$/, "")}/api/auth`,
  timeout: 10_000,
  headers: { Accept: "application/json" },
});

authApi.interceptors.response.use(undefined, toApiError);
