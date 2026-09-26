import { Response } from "express";

import Product from "../models/Product";
import InventoryTransaction from "../models/InventoryTransaction";

import { AuthRequest } from "../middlewares/auth.middleware";

/**
 * Calculate inventory health status.
 */
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

/**
 * Validate inventory quantity.
 *
 * Inventory quantities are treated as positive whole units.
 */
const validateQuantity = (value: unknown): number | null => {
  const quantity = Number(value);

  if (
    !Number.isFinite(quantity) ||
    quantity <= 0 ||
    !Number.isInteger(quantity)
  ) {
    return null;
  }

  return quantity;
};

/**
 * Reusable internal stock-in operation.
 *
 * This keeps all stock-in logic in one place so other modules
 * can safely use it later if required.
 */
export const addStockToInventory = async ({
  productId,
  quantity,
  reason,
  notes,
  performedBy,
}: {
  productId: string;
  quantity: number;
  reason?: string;
  notes?: string;
  performedBy?: string;
}) => {
  const validQuantity = validateQuantity(quantity);

  if (!validQuantity) {
    const error: any = new Error("Invalid quantity.");
    error.statusCode = 400;
    throw error;
  }

  const product = await Product.findById(productId);

  if (!product) {
    const error: any = new Error("Product not found.");
    error.statusCode = 404;
    throw error;
  }

  const previousStock = Number(product.currentStock || 0);

  product.currentStock =
    previousStock + validQuantity;

  product.status = getStockStatus(
    product.currentStock,
    Number(product.minimumStock || 0)
  );

  await product.save();

  await InventoryTransaction.create({
    product: product._id,
    warehouse: product.warehouse,
    type: "IN",
    quantity: validQuantity,
    previousStock,
    currentStock: product.currentStock,
    reason: reason || "Stock Added",
    notes,
    performedBy,
  });

  return product;
};

/**
 * Reusable stock-out operation.
 *
 * IMPORTANT:
 * Dispatch should use this function when actual inventory
 * needs to be deducted.
 *
 * This prevents Dispatch from implementing its own separate
 * inventory deduction logic.
 */
export const removeStockFromInventory = async ({
  productId,
  quantity,
  reason,
  notes,
  performedBy,
}: {
  productId: string;
  quantity: number;
  reason?: string;
  notes?: string;
  performedBy?: string;
}) => {
  const validQuantity = validateQuantity(quantity);

  if (!validQuantity) {
    const error: any = new Error("Invalid quantity.");
    error.statusCode = 400;
    throw error;
  }

  const product = await Product.findById(productId);

  if (!product) {
    const error: any = new Error("Product not found.");
    error.statusCode = 404;
    throw error;
  }

  const previousStock = Number(product.currentStock || 0);

  if (previousStock < validQuantity) {
    const error: any = new Error("Insufficient stock.");
    error.statusCode = 400;
    error.availableStock = previousStock;
    error.requestedQuantity = validQuantity;
    throw error;
  }

  product.currentStock =
    previousStock - validQuantity;

  product.status = getStockStatus(
    product.currentStock,
    Number(product.minimumStock || 0)
  );

  await product.save();

  await InventoryTransaction.create({
    product: product._id,
    warehouse: product.warehouse,
    type: "OUT",
    quantity: validQuantity,
    previousStock,
    currentStock: product.currentStock,
    reason: reason || "Stock Removed",
    notes,
    performedBy,
  });

  return product;
};

/**
 * Add stock.
 */
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

    const validQuantity = validateQuantity(quantity);

    if (!validQuantity) {
      return res.status(400).json({
        message:
          "Invalid quantity. Quantity must be a positive whole number.",
      });
    }

    const product = await addStockToInventory({
      productId,
      quantity: validQuantity,
      reason,
      notes,
      performedBy: req.user?.userId,
    });

    return res.json({
      message: "Stock added successfully",
      product,
    });
  } catch (error: any) {
    console.error("STOCK IN ERROR:", error);

    return res.status(error?.statusCode || 500).json({
      message:
        error?.message || "Failed to add stock",
    });
  }
};

/**
 * Remove stock.
 */
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

    const validQuantity = validateQuantity(quantity);

    if (!validQuantity) {
      return res.status(400).json({
        message:
          "Invalid quantity. Quantity must be a positive whole number.",
      });
    }

    const product = await removeStockFromInventory({
      productId,
      quantity: validQuantity,
      reason,
      notes,
      performedBy: req.user?.userId,
    });

    return res.json({
      message: "Stock removed successfully",
      product,
    });
  } catch (error: any) {
    console.error("STOCK OUT ERROR:", error);

    return res.status(error?.statusCode || 500).json({
      message:
        error?.message || "Failed to remove stock",

      ...(error?.availableStock !== undefined
        ? {
            availableStock: error.availableStock,
          }
        : {}),

      ...(error?.requestedQuantity !== undefined
        ? {
            requestedQuantity:
              error.requestedQuantity,
          }
        : {}),
    });
  }
};

/**
 * Get all inventory transactions.
 */
export const getTransactions = async (
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

    return res.json(transactions);
  } catch (error) {
    console.error(
      "GET INVENTORY TRANSACTIONS ERROR:",
      error
    );

    return res.status(500).json({
      message:
        "Failed to fetch transactions",
    });
  }
};

/**
 * Get recent transactions for a specific product.
 */
export const getTransactionsByProduct =
  async (
    req: AuthRequest,
    res: Response
  ) => {
    try {
      const transactions =
        await InventoryTransaction.find({
          product: req.params.id,
        })
          .populate(
            "performedBy",
            "name employeeId"
          )
          .populate(
            "warehouse",
            "name"
          )
          .sort({
            createdAt: -1,
          })
          .limit(5);

      return res.json(transactions);
    } catch (error) {
      console.error(
        "GET PRODUCT TRANSACTIONS ERROR:",
        error
      );

      return res.status(500).json({
        message:
          "Failed to fetch transactions",
      });
    }
  };