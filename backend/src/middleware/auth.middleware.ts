import type { RequestHandler } from "express";

import { ForbiddenError, UnauthorizedError } from "../exceptions";
import { verifyAccessToken } from "../lib/jwt";

const BEARER = /^Bearer\s+(\S+)$/i;

/**
 * Requires a valid JWT access token in `Authorization: Bearer <token>`.
 * 1. the header must be present,
 * 2. it must carry a Bearer token,
 * 3. the token must verify (signature, issuer, audience, expiry, claims).
 * The decoded claims are exposed as `req.user`.
 */
export const authorize: RequestHandler = async (req, _res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) throw new UnauthorizedError("Authentication required");

  const token = BEARER.exec(authHeader)?.[1];
  if (!token) throw new UnauthorizedError("Malformed authorization header");

  const decoded = await verifyAccessToken(token);
  if (!decoded) throw new UnauthorizedError("Invalid or expired token");

  req.user = decoded;
  next();
};

/** Requires an admin. Mount after `authorize`. */
export const authorizeAdmin: RequestHandler = (req, _res, next) => {
  if (!req.user) throw new UnauthorizedError("Authentication required");
  if (req.user.role !== "admin") throw new ForbiddenError("Admin access required");
  next();
};
