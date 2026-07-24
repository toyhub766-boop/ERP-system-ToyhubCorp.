import express from "express";

import authMiddleware from "../middlewares/auth.middleware";

import {
  getParties,
  getCustomerLedger,
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
      .populate("customer", "companyName")
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
router.get("/ledger/:customerId", getCustomerLedger);

// Money In / Money Out
router.post("/transaction", createTransaction);

//Update
router.put(
  "/transaction/:id",
  updateTransaction
);

//Delete
router.delete(
  "/transaction/:id",
  deleteTransaction
);

export default router;