import { Router } from "express";

import {
  createDispatch,
  getDispatches,
  updateDispatch,
} from "../controllers/dispatch.controller";

import authMiddleware from "../middlewares/auth.middleware";

const router = Router();

router.use(authMiddleware);

router.get("/", getDispatches);
           
router.post("/", createDispatch);

router.put("/:id", updateDispatch);

export default router;