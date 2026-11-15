import { fromNodeHeaders } from "better-auth/node";
import type { RequestHandler } from "express";

import { AppError } from "../exceptions";
import { auth } from "../lib/auth";

/** Rejects requests without a valid session; exposes it as `res.locals.session`. */
export const requireAuth: RequestHandler = async (req, res, next) => {
  const session = await auth.api.getSession({ headers: fromNodeHeaders(req.headers) });
  if (!session) throw new AppError(401, "UNAUTHORIZED", "Authentication required");
  res.locals.session = session;
  next();
};
