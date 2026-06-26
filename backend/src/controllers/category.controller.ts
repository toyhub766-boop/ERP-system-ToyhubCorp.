import { Request, Response } from "express";
import Category from "../models/Category";

export const getCategories = async (
  req: Request,
  res: Response
) => {
  try {
    const categories =
      await Category.find().sort({
        createdAt: -1,
      });

    res.json(categories);
  } catch {
    res.status(500).json({
      message: "Failed to fetch categories",
    });
  }
};

export const createCategory = async (
  req: Request,
  res: Response
) => {
  try {
    const category =
      await Category.create(req.body);

    res.status(201).json(category);
  } catch {
    res.status(500).json({
      message: "Failed to create category",
    });
  }
};

export const updateCategory = async (
  req: Request,
  res: Response
) => {
  try {
    const category =
      await Category.findByIdAndUpdate(
        req.params.id,
        req.body,
        {
          new: true,
        }
      );

    res.json(category);
  } catch {
    res.status(500).json({
      message: "Failed to update category",
    });
  }
};

export const deleteCategory = async (
  req: Request,
  res: Response
) => {
  try {
    await Category.findByIdAndDelete(
      req.params.id
    );

    res.json({
      message: "Category deleted",
    });
  } catch {
    res.status(500).json({
      message: "Failed to delete category",
    });
  }
};