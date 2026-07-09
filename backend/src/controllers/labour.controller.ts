import { Request, Response } from "express";
import Labour from "../models/Labour";

// GET ALL
export const getLabours = async (
  req: Request,
  res: Response
) => {
  try {
    const labours = await Labour.find().sort({
      createdAt: -1,
    });

    res.json(labours);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch labours.",
    });
  }
};

// CREATE
export const createLabour = async (
  req: Request,
  res: Response
) => {
  try {
    const labour = await Labour.create(req.body);

    res.status(201).json(labour);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to create labour.",
    });
  }
};

// UPDATE
export const updateLabour = async (
  req: Request,
  res: Response
) => {
  try {
    const labour = await Labour.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!labour) {
      return res.status(404).json({
        message: "Labour not found.",
      });
    }

    res.json(labour);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to update labour.",
    });
  }
};

// DELETE
export const deleteLabour = async (
  req: Request,
  res: Response
) => {
  try {
    const labour = await Labour.findByIdAndDelete(
      req.params.id
    );

    if (!labour) {
      return res.status(404).json({
        message: "Labour not found.",
      });
    }

    res.json({
      message: "Labour deleted successfully.",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to delete labour.",
    });
  }
};

export const getActiveLabours = async (
  req: Request,
  res: Response
) => {
  try {
    const labours = await Labour.find({
      status: "ACTIVE",
    }).sort({
      name: 1,
    });

    res.json(labours);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch active labours.",
    });
  }
};