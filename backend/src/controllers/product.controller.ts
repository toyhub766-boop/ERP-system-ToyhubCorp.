import { Request, Response } from "express";
import Product from "../models/Product";
import InventoryTransaction from "../models/InventoryTransaction";
import { AuthRequest } from "../middlewares/auth.middleware";
import Warehouse from "../models/Warehouse";

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

// ============================================================
// GET ALL PRODUCTS
// ============================================================

export const getProducts = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    let products: any[] = [];

    // FOUNDER → all products
    if (req.user?.role === "FOUNDER") {
      products = await Product.find()
        .populate("category", "name")
        .populate("warehouse", "name")
        .sort({ createdAt: -1 });
    }

    // INVENTORY → products belonging to their warehouses
    else if (req.user?.role === "INVENTORY") {
      const warehouses = await Warehouse.find({
        managers: req.user.userId,
      }).select("_id");

      const warehouseIds = warehouses.map(
        (warehouse) => warehouse._id
      );

      products = await Product.find({
        warehouse: {
          $in: warehouseIds,
        },
      })
        .populate("category", "name")
        .populate("warehouse", "name")
        .sort({ createdAt: -1 });
    }

    return res.json(products);
  } catch (error) {
    console.error("GET PRODUCTS ERROR:", error);

    return res.status(500).json({
      message: "Failed to fetch products",
    });
  }
};

// ============================================================
// CREATE PRODUCT
// ============================================================

export const createProduct = async (
  req: Request,
  res: Response
) => {
  try {
    const status = getStockStatus(
      Number(req.body.currentStock),
      Number(req.body.minimumStock)
    );

    const file = (req as any).file;

    const product = await Product.create({
      ...req.body,
      image: file ? file.path : "",
      status,
    });

    return res.status(201).json(product);
  } catch (error: any) {
    console.error("CREATE PRODUCT ERROR:");
    console.error(error);
    console.error(error?.message);
    console.error(error?.errors);

    return res.status(500).json({
      message:
        error?.message ||
        "Failed to create product",
    });
  }
};

// ============================================================
// UPDATE PRODUCT
// ============================================================

export const updateProduct = async (
  req: Request,
  res: Response
) => {
  try {
    const status = getStockStatus(
      Number(req.body.currentStock),
      Number(req.body.minimumStock)
    );

    const updateData: any = {
      ...req.body,
      status,
    };

    const file = (req as any).file;

    if (file) {
      updateData.image = file.path;
    }

    const product =
      await Product.findByIdAndUpdate(
        req.params.id,
        updateData,
        {
          new: true,
        }
      );

    return res.json(product);
  } catch (error) {
    console.error("UPDATE PRODUCT ERROR:", error);

    return res.status(500).json({
      message: "Failed to update product",
    });
  }
};

// ============================================================
// DELETE PRODUCT
// ============================================================

export const deleteProduct = async (
  req: Request,
  res: Response
) => {
  try {
    const transactionExists =
      await InventoryTransaction.exists({
        product: req.params.id,
      });

    if (transactionExists) {
      return res.status(400).json({
        message:
          "Cannot delete product. Inventory transactions exist.",
      });
    }

    await Product.findByIdAndDelete(
      req.params.id
    );

    return res.json({
      message: "Product deleted",
    });
  } catch (error) {
    console.error("DELETE PRODUCT ERROR:", error);

    return res.status(500).json({
      message: "Failed to delete product",
    });
  }
};

// ============================================================
// GET PRODUCT BY ID
// ============================================================

export const getProductById = async (
  req: Request,
  res: Response
) => {
  try {
    const product =
      await Product.findById(req.params.id)
        .populate("category", "name")
        .populate("warehouse", "name");

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    return res.json(product);
  } catch (error) {
    console.error("GET PRODUCT ERROR:", error);

    return res.status(500).json({
      message: "Failed to fetch product",
    });
  }
};