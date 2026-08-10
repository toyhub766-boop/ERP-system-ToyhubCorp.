import { Request, Response } from "express";
import { AuthRequest } from "../middlewares/auth.middleware";
import mongoose from "mongoose";

import AccountTransaction from "../models/AccountTransaction";
import AccountParty from "../models/AccountParty";

import { recalculatePartyBalance } from "../services/recalculatePartyBalance";

// ==============================
// GET ALL PARTIES
// ==============================

export const getParties = async (
  req: Request,
  res: Response
) => {
  try {
    const parties = await AccountParty.find().sort({
      createdAt: -1,
    });

    return res.json(parties);

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      message: "Failed to fetch parties.",
    });

  }
};

// ==============================
// GET PARTY LEDGER
// ==============================

export const getPartyLedger = async (
  req: Request,
  res: Response
) => {
  try {

    const ledger =
      await AccountTransaction.find({
        party: req.params.partyId,
      })
        .populate(
          "party",
          "companyName partyType"
        )
        .populate(
          "createdBy",
          "name"
        )
        .sort({
          date: -1,
        });

    return res.json(ledger);

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      message:
        "Failed to fetch ledger.",
    });

  }
};

// ==============================
// CREATE TRANSACTION
// ==============================

export const createTransaction = async (
  req: AuthRequest,
  res: Response
) => {
  const session =
    await mongoose.startSession();

  try {

    session.startTransaction();

    const {
  party,
  transactionType,
  amount,
  paymentMethod,

  utrNumber,
  otherReason,

  remarks,
  date,
} = req.body;

const file = (req as any).file;


    const partyDoc =
      await AccountParty.findById(
        party
      ).session(session);

    if (!partyDoc) {

      await session.abortTransaction();

      return res.status(404).json({
        message: "Party not found.",
      });

    }

    const transaction = new AccountTransaction({
  party,

  transactionType,

  amount: Number(amount),

  paymentMethod,

  utrNumber: utrNumber || "",

  otherReason: otherReason || "",

  attachment: file ? file.path : "",

  remarks: remarks || "",

  date: date || new Date(),

  balanceAfterTransaction: 0,

  createdBy: req.user?.userId,
});

    await transaction.save({
      session,
    });

    await session.commitTransaction();

    await recalculatePartyBalance(
      party
    );

    const updated =
      await AccountTransaction.findById(
        transaction._id
      )
        .populate(
          "party",
          "companyName partyType"
        )
        .populate(
          "createdBy",
          "name"
        );

    return res.status(201).json(
      updated
    );

  } catch (error) {

    await session.abortTransaction();

    console.error(error);

    return res.status(500).json({
      message:
        "Failed to create transaction.",
    });

  } finally {

    session.endSession();

  }
};

// ==============================
// UPDATE TRANSACTION
// ==============================

export const updateTransaction = async (
  req: AuthRequest,
  res: Response
) => {
  try {

    const transaction =
      await AccountTransaction.findById(
        req.params.id
      );

    if (!transaction) {
      return res.status(404).json({
        message:
          "Transaction not found.",
      });
    }

    const file = (req as any).file;

transaction.paymentMethod =
  req.body.paymentMethod;

transaction.utrNumber =
  req.body.utrNumber || "";

transaction.otherReason =
  req.body.otherReason || "";

if (file) {
  transaction.attachment = file.path;
}

transaction.remarks =
  req.body.remarks || "";

transaction.date =
  req.body.date || transaction.date;

    await transaction.save();

    await recalculatePartyBalance(
      transaction.party.toString()
    );

    const updated =
      await AccountTransaction.findById(
        transaction._id
      )
        .populate(
          "party",
          "companyName partyType"
        )
        .populate(
          "createdBy",
          "name"
        );

    return res.json(updated);

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      message:
        "Failed to update transaction.",
    });

  }
};

// ==============================
// DELETE TRANSACTION
// ==============================

export const deleteTransaction = async (
  req: AuthRequest,
  res: Response
) => {
  try {

    const transaction =
      await AccountTransaction.findById(
        req.params.id
      );

    if (!transaction) {
      return res.status(404).json({
        message:
          "Transaction not found.",
      });
    }

    const partyId =
      transaction.party.toString();

    await transaction.deleteOne();

    await recalculatePartyBalance(
      partyId
    );

    return res.json({
      message:
        "Transaction deleted successfully.",
    });

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      message:
        "Failed to delete transaction.",
    });

  }
};


// ==============================
// CRM CUSTOMER DUE DATES
// ==============================

export const getCustomerDueDates = async (
  req: Request,
  res: Response
) => {
  try {
    const customers = await AccountParty.find({
      partyType: "CUSTOMER",
      status: "Active",
    })
      .select(
        "partyCode companyName contactPerson phone currentBalance customerDetails.dueDate customerDetails.paymentTerms"
      )
      .sort({
        "customerDetails.dueDate": 1,
      });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const result = customers.map((customer: any) => {
      const dueDate = customer.customerDetails?.dueDate
        ? new Date(customer.customerDetails.dueDate)
        : null;

      if (dueDate) {
        dueDate.setHours(0, 0, 0, 0);
      }

      let status = "NO_DUE_DATE";

      if (dueDate) {
        if (dueDate < today) {
          status = "OVERDUE";
        } else if (
          dueDate.getTime() === today.getTime()
        ) {
          status = "DUE_TODAY";
        } else {
          status = "UPCOMING";
        }
      }

      const daysDifference = dueDate
        ? Math.ceil(
            (dueDate.getTime() - today.getTime()) /
              (1000 * 60 * 60 * 24)
          )
        : null;

      return {
        _id: customer._id,
        partyCode: customer.partyCode,

        companyName: customer.companyName,
        contactPerson: customer.contactPerson,
        phone: customer.phone,

        currentBalance:
          customer.currentBalance || 0,

        paymentTerms:
          customer.customerDetails?.paymentTerms || 0,

        dueDate,

        status,

        daysDifference,
      };
    });

    return res.json(result);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Failed to fetch customer due dates.",
    });
  }
};

// ==============================
// CRM CUSTOMER DUES
// ==============================

export const getCRMDueDates = async (
  req: Request,
  res: Response
) => {
  try {
    const parties = await AccountParty.find({
      partyType: "CUSTOMER",
      status: "Active",
    })
      .select(
        "partyCode companyName contactPerson phone currentBalance customerDetails"
      )
      .sort({
        "customerDetails.dueDate": 1,
      });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dues = parties.map((party: any) => {
      const rawDueDate =
        party.customerDetails?.dueDate;

      let dueDate: Date | null =
        rawDueDate
          ? new Date(rawDueDate)
          : null;

      if (dueDate) {
        dueDate.setHours(0, 0, 0, 0);
      }

      let status:
        | "OVERDUE"
        | "DUE_TODAY"
        | "UPCOMING"
        | "NO_DUE_DATE" =
        "NO_DUE_DATE";

      let daysRemaining:
        | number
        | null = null;

      if (dueDate) {
        daysRemaining = Math.ceil(
          (dueDate.getTime() -
            today.getTime()) /
            (1000 * 60 * 60 * 24)
        );

        if (daysRemaining < 0) {
          status = "OVERDUE";
        } else if (
          daysRemaining === 0
        ) {
          status = "DUE_TODAY";
        } else {
          status = "UPCOMING";
        }
      }

      return {
        _id: party._id,

        partyCode:
          party.partyCode,

        companyName:
          party.companyName,

        contactPerson:
          party.contactPerson,

        phone:
          party.phone,

        outstanding:
          Number(
            party.currentBalance || 0
          ),

        paymentTerms:
          Number(
            party.customerDetails
              ?.paymentTerms || 0
          ),

        dueDate,

        status,

        daysRemaining,
      };
    });

    return res.json(dues);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message:
        "Failed to fetch CRM due dates.",
    });
  }
};