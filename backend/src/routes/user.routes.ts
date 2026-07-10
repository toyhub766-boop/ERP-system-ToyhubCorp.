import { Router } from "express";
import authMiddleware from "../middlewares/auth.middleware";
import roleMiddleware from "../middlewares/role.middleware";

import {
  getUsers,
  createUser,
  getAttendanceUsers,
  updateUser,
  deleteUser,
} from "../controllers/user.controller";

const router = Router();

router.get("/", authMiddleware, getUsers);

router.post("/", authMiddleware,
  roleMiddleware(["FOUNDER"]), createUser);

router.get(
  "/attendance-users",
  authMiddleware,
  getAttendanceUsers
);

router.put("/:id", authMiddleware,
  roleMiddleware(["FOUNDER"]), updateUser);

router.delete("/:id", authMiddleware,
  roleMiddleware(["FOUNDER"]), deleteUser);

export default router;