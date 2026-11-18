import type { NextFunction, Request, Response } from "express";
import { describe, expect, it, vi } from "vitest";

import { errorHandler } from "../../src/middleware/error-handler";

function run(error: unknown) {
  const res = { headersSent: false, status: vi.fn(), json: vi.fn() };
  res.status.mockReturnValue(res);
  const req = { log: { error: vi.fn(), debug: vi.fn() } } as unknown as Request;
  errorHandler(error, req, res as unknown as Response, vi.fn() as NextFunction);
  return { status: res.status.mock.calls[0]?.[0], body: res.json.mock.calls[0]?.[0] };
}

/** Drizzle wraps node-postgres errors: "Failed query: …" with `cause`. */
function wrapped(code: string, constraint: string) {
  return new Error("Failed query: insert into products", {
    cause: Object.assign(new Error("duplicate"), { code, constraint }),
  });
}

describe("errorHandler: database constraint violations", () => {
  it("maps unique violations to 409 CONFLICT", () => {
    const { status, body } = run(wrapped("23505", "products_slug_unique"));
    expect(status).toBe(409);
    expect(body.error).toMatchObject({ code: "CONFLICT", details: [{ path: "products_slug_unique" }] });
  });

  it("maps foreign key violations to 409 CONFLICT", () => {
    expect(run(wrapped("23503", "products_category_id_categories_id_fk")).status).toBe(409);
  });

  it("maps check violations to 400 VALIDATION_ERROR", () => {
    const { status, body } = run(wrapped("23514", "products_stock_nonnegative"));
    expect(status).toBe(400);
    expect(body.error.code).toBe("VALIDATION_ERROR");
  });

  it("keeps other database errors as 500", () => {
    expect(run(wrapped("42P01", "")).status).toBe(500);
  });
});
