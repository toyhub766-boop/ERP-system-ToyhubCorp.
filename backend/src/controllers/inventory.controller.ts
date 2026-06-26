import { Response } from "express";
import Product from "../models/Product";
import InventoryTransaction from "../models/InventoryTransaction";
import { AuthRequest } from "../middlewares/auth.middleware";

const getStockStatus = (
  currentStock: number,
  minimumStock: number
) => {
  if (currentStock <= minimumStock * 0.25) {
    return "Critical";
  }

  if (currentStock <= minimumStock) {
    return "Low Stock";
  }

  return "Healthy";
};

export const stockIn = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const {
      productId,
      quantity,
      reason,
      notes,
    } = req.body;

    if (!quantity || quantity <= 0) {
      return res.status(400).json({
        message: "Invalid quantity",
      });
    }

    const product = await Product.findById(
      productId
    );

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    const previousStock =
      product.currentStock;

    product.currentStock += Number(quantity);
    product.status = getStockStatus(
      product.currentStock,
      product.minimumStock
    );

    await product.save();

    await InventoryTransaction.create({
      product: product._id,
      warehouse: product.warehouse,
      type: "IN",
      quantity,
      previousStock,
      currentStock:
        product.currentStock,
      reason:
        reason || "Stock Added",
      notes,
      performedBy:
        req.user?.userId,
    });

    return res.json({
      message:
        "Stock added successfully",
      product,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message:
        "Failed to add stock",
    });
  }
};

export const stockOut = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const {
      productId,
      quantity,
      reason,
      notes,
    } = req.body;

    if (!quantity || quantity <= 0) {
      return res.status(400).json({
        message: "Invalid quantity",
      });
    }

    const product = await Product.findById(
      productId
    );

    console.log({
  currentStock: product?.currentStock,
  quantity: Number(quantity),
});

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    if (
      product.currentStock <
      Number(quantity)
    ) {
      return res.status(400).json({
        message:
          "Insufficient stock",
      });
    }

    const previousStock =
      product.currentStock;

    product.currentStock -= Number(quantity);

    product.status = getStockStatus(
      product.currentStock,
      product.minimumStock
    );

    await product.save();

    await InventoryTransaction.create({
      product: product._id,
      warehouse: product.warehouse,
      type: "OUT",
      quantity,
      previousStock,
      currentStock:
        product.currentStock,
      reason:
        reason || "Stock Removed",
      notes,
      performedBy:
        req.user?.userId,
    });

    return res.json({
      message:
        "Stock removed successfully",
      product,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message:
        "Failed to remove stock",
    });
  }
};

export const getTransactions =
  async (
    _req: AuthRequest,
    res: Response
  ) => {
    try {
      const transactions =
        await InventoryTransaction.find()
          .populate(
            "product",
            "name sku"
          )
          .populate(
            "warehouse",
            "name"
          )
          .populate(
            "performedBy",
            "name"
          )
          .sort({
            createdAt: -1,
          });

      res.json(transactions);
    } catch {
      res.status(500).json({
        message:
          "Failed to fetch transactions",
      });
    }
  };