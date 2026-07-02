import { Request, Response } from "express";
import Product from "../models/Product";

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


export const getProducts = async (
  req: Request,
  res: Response
) => {
  try {
    const products = await Product.find()
      .populate("category", "name")
      .populate("warehouse", "name")
      .sort({ createdAt: -1 });

    res.json(products);
  } catch {
    res.status(500).json({
      message: "Failed to fetch products",
    });
  }
};

export const createProduct = async (
  req: Request,
  res: Response
) => {
  try {
    const status = getStockStatus(
      Number(req.body.currentStock),
      Number(req.body.minimumStock)
    );

    const product = await Product.create({
      ...req.body,
      status,
    });

    res.status(201).json(product);
  } catch (error: any) {
  console.error("CREATE PRODUCT ERROR:");
  console.error(error);
  console.error(error?.message);
  console.error(error?.errors);

  return res.status(500).json({
    message: error?.message || "Failed to create product",
  });
}
};

export const updateProduct = async (
  req: Request,
  res: Response
) => {
  try {
    const status = getStockStatus(
      Number(req.body.currentStock),
      Number(req.body.minimumStock)
    );

    const product =
      await Product.findByIdAndUpdate(
        req.params.id,
        {
          ...req.body,
          status,
        },
        {
          new: true,
        }
      );

    res.json(product);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to update product",
    });
  }
};

export const deleteProduct = async (
  req: Request,
  res: Response
) => {
  try {
    await Product.findByIdAndDelete(
      req.params.id
    );

    res.json({
      message: "Product deleted",
    });
  } catch {
    res.status(500).json({
      message: "Failed to delete product",
    });
  }
};

export const getProductById = async (
  req: Request,
  res: Response
) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate("category", "name")
      .populate("warehouse", "name");

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    res.json(product);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch product",
    });
  }
};