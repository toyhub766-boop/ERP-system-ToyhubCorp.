import express from "express";

import authMiddleware from "../middlewares/auth.middleware";

import {
  getParties,
  getCustomerLedger,
  createTransaction,
  updateTransaction,
  deleteTransaction,
} from "../controllers/accountTransaction.controller";

const router = express.Router();

router.use(authMiddleware);

// Left Panel
router.get("/parties", (_req, res) => {
  console.log("PARTIES ROUTE HIT");
  res.json([
    {
      _id: "1",
      companyName: "ABC Toys",
      currentBalance: 2500,
    },
  ]);
});

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