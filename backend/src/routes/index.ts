import { Router } from "express";

import authRouter from "./auth.js";
import assetRouter from "./assets.js";
import taskRouter from "./tasks.js";
import usersRouter from "./users.js";

const router = Router();

router.use("/auth", authRouter);
router.use("/assets", assetRouter);
router.use("/tasks", taskRouter);
router.use("/users", usersRouter);

export default router;
