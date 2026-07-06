import { Request, Response } from "express";
import Payment from "../models/Payment";

// GET ALL
export const getPayments = async (
  req: Request,
  res: Response
) => {
  try {
    const payments = await Payment.find()
      .populate({
        path: "order",
        populate: {
          path: "customer",
        },
      })
      .sort({ createdAt: -1 });

    res.json(payments);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch payments",
    });
  }
};

// GET ONE
export const getPaymentById = async (
  req: Request,
  res: Response
) => {
  try {
    const payment = await Payment.findById(
      req.params.id
    ).populate({
      path: "order",
      populate: {
        path: "customer",
      },
    });

    if (!payment) {
      return res.status(404).json({
        message: "Payment not found",
      });
    }

    res.json(payment);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch payment",
    });
  }
};

// CREATE
export const createPayment = async (
  req: Request,
  res: Response
) => {
  try {
    const payment = await Payment.create(
      req.body
    );

    res.status(201).json(payment);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to create payment",
    });
  }
};

// UPDATE
export const updatePayment = async (
  req: Request,
  res: Response
) => {
  try {
    const payment =
      await Payment.findByIdAndUpdate(
        req.params.id,
        req.body,
        {
          new: true,
        }
      );

    if (!payment) {
      return res.status(404).json({
        message: "Payment not found",
      });
    }

    res.json(payment);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to update payment",
    });
  }
};

// DELETE
export const deletePayment = async (
  req: Request,
  res: Response
) => {
  try {
    const payment =
      await Payment.findByIdAndDelete(
        req.params.id
      );

    if (!payment) {
      return res.status(404).json({
        message: "Payment not found",
      });
    }

    res.json({
      message: "Payment deleted",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to delete payment",
    });
  }
};