import type { RequestHandler } from "express";

import { ForbiddenError, UnauthorizedError } from "../exceptions";
import { verifyAccessToken } from "../lib/jwt";
import { userService } from "../services/user.service";

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

/**
 * For public routes that also serve signed-in users: a valid Bearer token
 * sets `req.user`; a missing or invalid one is ignored (the caller is a guest).
 */
export const optionalAuthorize: RequestHandler = async (req, _res, next) => {
  const token = BEARER.exec(req.headers.authorization ?? "")?.[1];
  if (token) {
    const decoded = await verifyAccessToken(token);
    if (decoded) req.user = decoded;
  }
  next();
};

/**
 * Requires an admin. Mount after `authorize`. The token's role claim is
 * checked first (cheap), then the database, so a demoted or banned admin
 * loses access at once rather than when their token expires.
 */
export const authorizeAdmin: RequestHandler = async (req, _res, next) => {
  if (!req.user) throw new UnauthorizedError("Authentication required");
  if (req.user.role !== "admin") throw new ForbiddenError("Admin access required");
  await userService.assertActiveAdmin(req.user.sub);
  next();
};

/** Logs every admin write (who, what, outcome) once the response is sent. */
export const auditAdminWrites: RequestHandler = (req, res, next) => {
  if (req.method !== "GET" && req.method !== "HEAD") {
    res.on("finish", () => {
      req.log.info(
        {
          audit: true,
          actor: req.user?.sub,
          actorEmail: req.user?.email,
          method: req.method,
          path: req.originalUrl,
          status: res.statusCode,
        },
        "Admin write",
      );
    });
  }
  next();
};
