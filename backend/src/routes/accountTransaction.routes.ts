import express from "express";

import authMiddleware from "../middlewares/auth.middleware";

import upload from "../middlewares/upload.middleware";

import {
  getParties,
  getPartyLedger,
  createTransaction,
  updateTransaction,
  deleteTransaction,
} from "../controllers/accountTransaction.controller";

import AccountTransaction from "../models/AccountTransaction";

const router = express.Router();

router.use(authMiddleware);

router.get("/", async (_req, res) => {
  try {
    const transactions = await AccountTransaction.find()
      .populate("party", "companyName")
      .sort({ createdAt: -1 });

    res.json(transactions);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Failed to fetch accounts report.",
    });
  }
});

// Left Panel
router.get("/parties", getParties);


// Right Panel
router.get("/ledger/:partyId", getPartyLedger);

router.post(
  "/transaction",
  upload.single("attachment"),
  createTransaction
);

router.put(
  "/transaction/:id",
  upload.single("attachment"),
  updateTransaction
);

//Delete
router.delete(
  "/transaction/:id",
  deleteTransaction
);

export default router;