import type { Request, Response } from "express";

import { toMeDto } from "../dtos/user.dto";
import { userService } from "../services/user.service";
import { sendOk } from "../utils/http-response";

export const userController = {
  /** Requires `authorize`, which sets `req.user`. */
  async getMe(req: Request, res: Response) {
    const user = await userService.getCurrent(req.user!.sub);
    sendOk(res, toMeDto(user));
  },
};
