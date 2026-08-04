import express from "express";
import authMiddleware from "../middlewares/auth.middleware";

import {
  getParties,
  getPartyById,
  createParty,
  updateParty,
  deleteParty,
} from "../controllers/accountParty.controller";

const router = express.Router();

router.use(authMiddleware);

router.get("/", getParties);
router.get("/:id", getPartyById);

router.post("/", createParty);

router.put("/:id", updateParty);

router.delete("/:id", deleteParty);

export default router;