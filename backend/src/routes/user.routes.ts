import { Router } from "express";
import authMiddleware from "../middlewares/auth.middleware";
import roleMiddleware from "../middlewares/role.middleware";

import {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
} from "../controllers/user.controller";

const router = Router();

router.get("/", authMiddleware, getUsers);

router.post("/", authMiddleware,
  roleMiddleware(["FOUNDER"]), createUser);

router.put("/:id", authMiddleware,
  roleMiddleware(["FOUNDER"]), updateUser);

router.delete("/:id", authMiddleware,
  roleMiddleware(["FOUNDER"]), deleteUser);

export default router;