import { Request, Response } from "express";
import BOM from "../models/BOM";

export const getBOMs = async (
  req: Request,
  res: Response
) => {
  try {
    const boms = await BOM.find()
      .populate("finishedProduct")
      .populate("materials.product")
      .sort({ createdAt: -1 });

    res.json(boms);
  } catch {
    res.status(500).json({
      message: "Failed to fetch BOMs",
    });
  }
};

export const getBOMById = async (
  req: Request,
  res: Response
) => {
  try {
    const bom = await BOM.findById(req.params.id)
      .populate("finishedProduct")
      .populate("materials.product");

    res.json(bom);
  } catch {
    res.status(500).json({
      message: "Failed to fetch BOM",
    });
  }
};

export const createBOM = async (
  req: Request,
  res: Response
) => {
  try {
    const existingBOM = await BOM.findOne({
  finishedProduct: req.body.finishedProduct,
});

if (existingBOM) {
  return res.status(400).json({
    message: "A BOM already exists for this finished product.",
  });
}

const bom = await BOM.create(req.body);

    const populatedBom = await BOM.findById(bom._id)
      .populate("finishedProduct")
      .populate("materials.product");

    res.status(201).json(populatedBom);
  } catch {
    res.status(500).json({
      message: "Failed to create BOM",
    });
  }
};

export const updateBOM = async (
  req: Request,
  res: Response
) => {
  try {
    const bom = await BOM.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
      }
    )
      .populate("finishedProduct")
      .populate("materials.product");

    res.json(bom);
  } catch {
    res.status(500).json({
      message: "Failed to update BOM",
    });
  }
};

export const deleteBOM = async (
  req: Request,
  res: Response
) => {
  try {
    await BOM.findByIdAndDelete(req.params.id);

    res.json({
      message: "BOM deleted",
    });
  } catch {
    res.status(500).json({
      message: "Failed to delete BOM",
    });
  }
};