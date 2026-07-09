import { Request, Response } from "express";
import Order from "../models/Order";

// GET ALL
export const getOrders = async (
  req: Request,
  res: Response
) => {
  try {
    const orders = await Order.find()
      .populate("customer")
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch orders",
    });
  }
};

// GET ONE
export const getOrderById = async (
  req: Request,
  res: Response
) => {
  try {
    const order = await Order.findById(
      req.params.id
    ).populate("customer");

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    res.json(order);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch order",
    });
  }
};

export const getOrdersByCustomer = async (
  req: Request,
  res: Response
) => {
  try {
    const orders = await Order.find({
      customer: req.params.customerId,
    }).sort({
      createdAt: -1,
    });

    res.json(orders);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch customer orders",
    });
  }
};

// CREATE
export const createOrder = async (
  req: Request,
  res: Response
) => {
  try {
    const lastOrder = await Order.findOne()
      .sort({ createdAt: -1 });

    let nextNumber = 1;

    if (lastOrder?.orderNumber) {
      const current = parseInt(
        lastOrder.orderNumber.replace("ORD-", "")
      );

      nextNumber = current + 1;
    }

    const order = await Order.create({
      ...req.body,
      orderNumber: `ORD-${String(nextNumber).padStart(4, "0")}`,
    });

    res.status(201).json(order);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to create order",
    });
  }
};

// UPDATE
export const updateOrder = async (
  req: Request,
  res: Response
) => {
  try {
    const order =
      await Order.findByIdAndUpdate(
        req.params.id,
        req.body,
        {
          new: true,
        }
      );

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    res.json(order);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to update order",
    });
  }
};

// DELETE
export const deleteOrder = async (
  req: Request,
  res: Response
) => {
  try {
    const order =
      await Order.findByIdAndDelete(
        req.params.id
      );

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    res.json({
      message: "Order deleted",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to delete order",
    });
  }
};