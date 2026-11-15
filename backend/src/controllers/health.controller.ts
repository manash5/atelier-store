import type { Request, Response } from "express";

import { healthService } from "../services/health.service";
import { sendOk } from "../utils/http-response";

export const healthController = {
  async check(_req: Request, res: Response) {
    res.setHeader("Cache-Control", "no-store");
    sendOk(res, await healthService.check());
  },
};
