import { Request, Response } from "express";
import { AuthRequest } from "../middlewares/auth.middleware";
import mongoose from "mongoose";
import AccountTransaction from "../models/AccountTransaction";
import Customer from "../models/customer";

export const getParties = async (
  req: Request,
  res: Response
) => {
  const parties = await Customer.find();

  console.log("PARTIES:", parties.length);
  console.log(parties);

  res.json(parties);
};


export const getCustomerLedger = async (
    req: Request,
    res: Response
) => {
    try {
        const ledger = await AccountTransaction.find({
            customer: req.params.customerId,
        })
            .populate("createdBy", "name")
            .sort({
                date: -1,
            });

        res.json(ledger);
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to fetch ledger.",
        });
    }
};

export const createTransaction = async (
  req: AuthRequest,
  res: Response
) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const {
      customer,
      transactionType,
      amount,
      paymentMethod,
      remarks,
    } = req.body;

    const customerDoc = await Customer.findById(customer).session(session);

    if (!customerDoc) {
      await session.abortTransaction();
      return res.status(404).json({
        message: "Customer not found.",
      });
    }

    const updatedBalance =
      transactionType === "MONEY_IN"
        ? customerDoc.currentBalance + Number(amount)
        : customerDoc.currentBalance - Number(amount);

    const transaction = new AccountTransaction({
      customer,
      transactionType,
      amount: Number(amount),
      paymentMethod,
      remarks,
      balanceAfterTransaction: updatedBalance,
      createdBy: req.user?.userId,
    });

    await transaction.save({ session });

    customerDoc.currentBalance = updatedBalance;
    await customerDoc.save({ session });

    await session.commitTransaction();

    return res.status(201).json(transaction);

  } catch (error) {

    await session.abortTransaction();

    console.error("CREATE TRANSACTION ERROR");
    console.error(error);

    return res.status(500).json({
      message: "Failed to create transaction",
    });

  } finally {

    session.endSession();

  }
};

export const updateTransaction = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const transaction =
      await AccountTransaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({
        message: "Transaction not found.",
      });
    }

    transaction.transactionType =
      req.body.transactionType;

    transaction.amount =
      Number(req.body.amount);

    transaction.paymentMethod =
      req.body.paymentMethod;

    transaction.remarks =
      req.body.remarks;

    await transaction.save();

    res.json(transaction);

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to update transaction.",
    });
  }
};

export const deleteTransaction = async (
  req: AuthRequest,
  res: Response
) => {
  try {

    const transaction =
      await AccountTransaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({
        message: "Transaction not found.",
      });
    }

    const customerId =
      transaction.customer.toString();

    await transaction.deleteOne();

    res.json({
      message:
        "Transaction deleted successfully.",
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message:
        "Failed to delete transaction.",
    });

  }
};

