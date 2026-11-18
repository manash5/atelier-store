import { Router } from "express";

import { userController } from "../controllers/user.controller";
import { authorize } from "../middleware/auth.middleware";

export const meRouter = Router();

meRouter.get("/", authorize, userController.getMe);
