import { Request, Response } from "express";
import Warehouse from "../models/Warehouse";
import authMiddleware, {
  AuthRequest,
} from "../middlewares/auth.middleware";

export const getWarehouses = async (
  req: AuthRequest,
  res: Response
) => {
  try {

let warehouses: any[] = [];


    if (req.user?.role === "FOUNDER") {

      warehouses = await Warehouse.find()
        .populate("managers", "name")
        .sort({ createdAt: -1 });

    } else if (req.user?.role === "INVENTORY") {

      warehouses = await Warehouse.find({
  managers: req.user.userId,
})
  .populate("managers", "name")
  .sort({ createdAt: -1 });

    } else {

      warehouses = [];

    }

    res.json(warehouses);

  } catch {

    res.status(500).json({
      message: "Failed to fetch warehouses",
    });

  }
};

export const createWarehouse = async (
  req: Request,
  res: Response
) => {
  try {
    const warehouse =
      await Warehouse.create(req.body);

    res.status(201).json(warehouse);
  } catch {
    res.status(500).json({
      message: "Failed to create warehouse",
    });
  }
};

export const updateWarehouse = async (
  req: Request,
  res: Response
) => {
  try {
    const warehouse =
      await Warehouse.findByIdAndUpdate(
        req.params.id,
        req.body,
        {
          new: true,
        }
      );

    res.json(warehouse);
  } catch {
    res.status(500).json({
      message: "Failed to update warehouse",
    });
  }
};

export const deleteWarehouse = async (
  req: Request,
  res: Response
) => {
  try {
    await Warehouse.findByIdAndDelete(
      req.params.id
    );

    res.json({
      message: "Warehouse deleted",
    });
  } catch {
    res.status(500).json({
      message: "Failed to delete warehouse",
    });
  }
};