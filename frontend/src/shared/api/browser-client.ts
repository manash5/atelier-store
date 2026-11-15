import axios from "axios";

import { toApiError } from "./errors";

// For Client Components. Requests go to the storefront's own origin and
// next.config.ts rewrites /api/v1/* to the backend, so session cookies stay
// first-party and the backend URL is never exposed.
export const browserApi = axios.create({
  baseURL: "/api/v1",
  timeout: 10_000,
  withCredentials: true,
  headers: { Accept: "application/json" },
});

browserApi.interceptors.response.use(undefined, toApiError);
