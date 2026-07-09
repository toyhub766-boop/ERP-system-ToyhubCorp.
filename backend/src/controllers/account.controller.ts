import { Request, Response } from "express";
import Account from "../models/Account";

// GET ALL TRANSACTIONS
export const getAccounts = async (
  req: Request,
  res: Response
) => {
  try {
    const accounts = await Account.find().sort({ date: -1 });

    res.json(accounts);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch account transactions.",
    });
  }
};

// CREATE TRANSACTION
export const createAccount = async (
  req: Request,
  res: Response
) => {
  try {
    const account = await Account.create(req.body);

    res.status(201).json(account);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to create transaction.",
    });
  }
};

// UPDATE TRANSACTION
export const updateAccount = async (
  req: Request,
  res: Response
) => {
  try {
    const account = await Account.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!account) {
      return res.status(404).json({
        message: "Transaction not found.",
      });
    }

    res.json(account);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to update transaction.",
    });
  }
};

// DELETE TRANSACTION
export const deleteAccount = async (
  req: Request,
  res: Response
) => {
  try {
    const account = await Account.findByIdAndDelete(
      req.params.id
    );

    if (!account) {
      return res.status(404).json({
        message: "Transaction not found.",
      });
    }

    res.json({
      message: "Transaction deleted successfully.",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to delete transaction.",
    });
  }
};

// FINANCIAL SUMMARY
export const getAccountSummary = async (
  req: Request,
  res: Response
) => {
  try {
    const transactions = await Account.find();

    const totalIncome = transactions
      .filter((t) => t.type === "Income")
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpense = transactions
      .filter((t) => t.type === "Expense")
      .reduce((sum, t) => sum + t.amount, 0);

    res.json({
      totalIncome,
      totalExpense,
      netBalance: totalIncome - totalExpense,
      totalTransactions: transactions.length,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch financial summary.",
    });
  }
};