import express from "express";

import {
  getParties,
  getPartyById,
  createParty,
  updateParty,
  updatePartyDueDate,
  deleteParty,
} from "../controllers/accountParty.controller";

const router = express.Router();

// Get all parties
router.get("/", getParties);

// Create party
router.post("/", createParty);

// Update due date ONLY
// Keep this before /:id
router.patch(
  "/:id/due-date",
  updatePartyDueDate
);

// Get single party
router.get("/:id", getPartyById);

// Update entire party
router.put("/:id", updateParty);

// Delete party
router.delete("/:id", deleteParty);

export default router;