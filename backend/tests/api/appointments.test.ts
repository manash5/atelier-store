import request from "supertest";
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import { createApp } from "../../src/app";
import { pool } from "../../src/database";
import { AppointmentDto, AppointmentReceiptDto } from "../../src/dtos/appointment.dto";
import { auth } from "../../src/lib/auth";
import { resetKeyCache } from "../../src/lib/jwt";
import { appointmentRateLimit } from "../../src/middleware/rate-limit";
import type { AppointmentRequest } from "../../src/models/appointment";
import { appointmentRepository } from "../../src/repositories/appointment.repository";
import { userRepository } from "../../src/repositories/user.repository";
import { createTestKeys, type TestKeys } from "../helpers/tokens";

const app = createApp();

/** The per-IP limiter is shared by every request in this file: start each test fresh. */
function resetRateLimit() {
  for (const ip of ["::ffff:127.0.0.1", "127.0.0.1", "::1"]) appointmentRateLimit.resetKey(ip);
}

function row(overrides: Partial<AppointmentRequest> = {}): AppointmentRequest {
  return {
    id: 1,
    name: "Ada Lovelace",
    email: "ada@example.com",
    phone: "+44 20 7946 0958",
    type: "in_store",
    preferredDate: null,
    note: null,
    status: "new",
    userId: null,
    createdAt: new Date("2026-11-18T10:00:00Z"),
    updatedAt: new Date("2026-11-18T10:00:00Z"),
    ...overrides,
  };
}

function inDays(days: number): string {
  const day = new Date();
  day.setUTCDate(day.getUTCDate() + days);
  return day.toISOString().slice(0, 10);
}

const valid = { name: "Ada Lovelace", email: "Ada@Example.com", phone: "+44 20 7946 0958" };

let keys: TestKeys;

beforeAll(async () => {
  keys = await createTestKeys();
});

beforeEach(() => {
  vi.restoreAllMocks();
  resetKeyCache();
  vi.spyOn(auth.api, "getJwks").mockResolvedValue(keys.jwks as never);
  resetRateLimit();
});

afterAll(async () => {
  await pool.end();
});

describe("POST /api/v1/appointments", () => {
  it("stores a guest's request and returns a receipt without their details", async () => {
    const insert = vi
      .spyOn(appointmentRepository, "insert")
      .mockImplementation(async (values) => row({ ...values, id: 7 } as Partial<AppointmentRequest>));
    const res = await request(app)
      .post("/api/v1/appointments")
      .send({ ...valid, type: "video", preferredDate: inDays(3), note: "  Bridal fitting  " });

    expect(res.status).toBe(201);
    expect(AppointmentReceiptDto.strict().parse(res.body.data)).toMatchObject({ id: 7, type: "video" });
    expect(insert).toHaveBeenCalledWith({
      name: "Ada Lovelace",
      email: "ada@example.com",
      phone: "+44 20 7946 0958",
      type: "video",
      preferredDate: inDays(3),
      note: "Bridal fitting",
      userId: null,
    });
  });

  it("links the request to a signed-in customer, and ignores a bad token", async () => {
    const insert = vi.spyOn(appointmentRepository, "insert").mockResolvedValue(row());
    const token = await keys.sign({ email: "ada@example.com", name: "Ada", role: "user" }, { subject: "u-42" });

    await request(app).post("/api/v1/appointments").set("Authorization", `Bearer ${token}`).send(valid);
    expect(insert.mock.calls[0]![0]).toMatchObject({ userId: "u-42" });

    const res = await request(app).post("/api/v1/appointments").set("Authorization", "Bearer x.y.z").send(valid);
    expect(res.status).toBe(201);
    expect(insert.mock.calls[1]![0]).toMatchObject({ userId: null });
  });

  it.each([
    ["a missing name", { ...valid, name: " " }],
    ["a bad email", { ...valid, email: "not-an-email" }],
    ["a bad phone", { ...valid, phone: "call me" }],
  ])("rejects %s", async (_label, body) => {
    const insert = vi.spyOn(appointmentRepository, "insert");
    const res = await request(app).post("/api/v1/appointments").send(body);
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
    expect(insert).not.toHaveBeenCalled();
  });
});

describe("appointment validation and rate limit", () => {
  it.each([
    ["a past date", { ...valid, preferredDate: inDays(-10) }],
    ["a date over a year ahead", { ...valid, preferredDate: inDays(400) }],
    ["an unknown type", { ...valid, type: "phone" }],
    ["a too-short phone", { ...valid, phone: "12-34" }],
  ])("rejects %s", async (_label, body) => {
    const res = await request(app).post("/api/v1/appointments").send(body);
    expect(res.status).toBe(400);
  });

  it("allows 5 requests per IP per 15 minutes", async () => {
    vi.spyOn(appointmentRepository, "insert").mockResolvedValue(row());
    for (let i = 0; i < 5; i++) {
      expect((await request(app).post("/api/v1/appointments").send(valid)).status).toBe(201);
    }
    const res = await request(app).post("/api/v1/appointments").send(valid);
    expect(res.status).toBe(429);
    expect(res.body.error.code).toBe("RATE_LIMITED");
  });
});

describe("admin appointments", () => {
  async function asAdmin() {
    vi.spyOn(userRepository, "findById").mockResolvedValue({
      id: "admin-1",
      name: "Admin",
      email: "admin@example.com",
      emailVerified: true,
      image: null,
      role: "admin",
      banned: false,
      banReason: null,
      banExpires: null,
      createdAt: new Date(0),
      updatedAt: new Date(0),
    });
    return keys.sign({ email: "admin@example.com", name: "Admin", role: "admin" }, { subject: "admin-1" });
  }

  it("requires an admin", async () => {
    expect((await request(app).get("/api/v1/admin/appointments")).status).toBe(401);
    const customer = await keys.sign({ email: "ada@example.com", name: "Ada", role: "user" });
    const res = await request(app).get("/api/v1/admin/appointments").set("Authorization", `Bearer ${customer}`);
    expect(res.status).toBe(403);
  });

  it("lists requests with filters", async () => {
    const token = await asAdmin();
    const findPage = vi.spyOn(appointmentRepository, "findPage").mockResolvedValue([row({ userId: "u1" })]);
    vi.spyOn(appointmentRepository, "count").mockResolvedValue(1);
    const res = await request(app)
      .get("/api/v1/admin/appointments?status=new&q=ada&page=2&limit=10")
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(AppointmentDto.parse(res.body.data[0])).toMatchObject({ hasAccount: true, status: "new" });
    expect(res.body.meta).toEqual({ page: 2, limit: 10, total: 1 });
    expect(findPage).toHaveBeenCalledWith(10, 10, { status: "new", search: "ada" });
  });

  it("marks a request contacted", async () => {
    const token = await asAdmin();
    vi.spyOn(appointmentRepository, "setStatus").mockResolvedValue(row({ status: "contacted" }));
    const res = await request(app)
      .patch("/api/v1/admin/appointments/1/status")
      .set("Authorization", `Bearer ${token}`)
      .send({ status: "contacted" });
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe("contacted");
  });

  it("404s for unknown requests and rejects unknown statuses", async () => {
    const token = await asAdmin();
    vi.spyOn(appointmentRepository, "setStatus").mockResolvedValue(null);
    const missing = await request(app)
      .patch("/api/v1/admin/appointments/999/status")
      .set("Authorization", `Bearer ${token}`)
      .send({ status: "contacted" });
    expect(missing.status).toBe(404);
    const bad = await request(app)
      .patch("/api/v1/admin/appointments/1/status")
      .set("Authorization", `Bearer ${token}`)
      .send({ status: "booked" });
    expect(bad.status).toBe(400);
  });
});
