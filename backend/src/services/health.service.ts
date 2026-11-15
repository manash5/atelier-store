import { healthRepository } from "../repositories/health.repository";

export const healthService = {
  async check(): Promise<{ status: "ok"; database: "ok" }> {
    await healthRepository.ping();
    return { status: "ok", database: "ok" };
  },
};
