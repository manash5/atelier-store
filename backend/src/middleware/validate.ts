import type { Request, RequestHandler } from "express";
import type { z } from "zod";

import { ValidationError } from "../exceptions";

type Part = "params" | "query" | "body";
type Schemas = Partial<Record<Part, z.ZodType>>;

/**
 * Parses request parts with Zod and stores the typed output on
 * `req.validated` (Express 5 makes `req.query` read-only). Unknown keys are
 * stripped by the object schemas; failures become a 400 VALIDATION_ERROR.
 */
export function validate(schemas: Schemas): RequestHandler {
  return (req, _res, next) => {
    req.validated ??= {};
    for (const part of ["params", "query", "body"] as const) {
      const schema = schemas[part];
      if (!schema) continue;
      const result = schema.safeParse(req[part]);
      if (!result.success) throw new ValidationError(result.error);
      req.validated[part] = result.data;
    }
    next();
  };
}

/** Typed read of data parsed by `validate` with the same schema. */
export function validated<S extends z.ZodType>(
  req: Request,
  part: Part,
  _schema: S,
): z.output<S> {
  return req.validated[part] as z.output<S>;
}
