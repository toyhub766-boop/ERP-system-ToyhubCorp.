import { Request, Response } from "express";
import { AuthRequest } from "../middlewares/auth.middleware";
import mongoose from "mongoose";
import AccountTransaction from "../models/AccountTransaction";
import Customer from "../models/customer";
import { recalculateCustomerBalance } from "../services/ledger.service";

export const getParties = async (
    req: Request,
    res: Response
) => {
    try {
        const parties = await Customer.find().sort({
            companyName: 1,
        });

        res.json(parties);
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to fetch parties.",
        });
    }
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

        let updatedBalance = customerDoc.currentBalance;

        if (transactionType === "MONEY_IN") {
            updatedBalance += Number(amount);
        } else {
            updatedBalance -= Number(amount);
        }

        const transaction = await AccountTransaction.create(
            [
                {
                    customer,
                    transactionType,
                    amount,
                    paymentMethod,
                    remarks,
                    balanceAfterTransaction: updatedBalance,
                    createdBy: new mongoose.Types.ObjectId(req.user!.userId),
                },
            ],
            { session }
        );

        await session.commitTransaction();

        await recalculateCustomerBalance(customer._id.toString());

        return res.status(201).json(transaction[0]);

        await session.commitTransaction();

        res.status(201).json(transaction[0]);
    } catch (error) {
        await session.abortTransaction();

        console.error(error);

        res.status(500).json({
            message: "Failed to create transaction.",
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

    await recalculateCustomerBalance(
      transaction.customer.toString()
    );

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

    await recalculateCustomerBalance(
      customerId
    );

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