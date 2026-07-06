import { Response } from "express";

import { AuthRequest } from "../middlewares/auth.middleware";

import MaterialConsumption from "../models/MaterialConsumption";

import Production from "../models/Production";
import BOM from "../models/BOM";
import { calculateMaterialAvailability } from "../utils/production.utils";

export const createProduction = async (req: AuthRequest, res: Response) => {
  try {
    const { bom, quantity, team, targetDate, notes } = req.body;

    const existingBOM = await BOM.findById(bom);

    if (!existingBOM) {
      return res.status(404).json({
        message: "BOM not found",
      });
    }

    const count = (await Production.countDocuments()) + 1;

    const orderNumber = `PROD-${new Date().getFullYear()}-${String(
      count,
    ).padStart(3, "0")}`;

    const production = await Production.create({
      orderNumber,

      bom,

      finishedProduct: existingBOM.finishedProduct,

      quantity,

      team,

      targetDate,

      notes,

      createdBy: req.user?.userId,
    });

    const populated = await Production.findById(production._id)
      .populate("bom")
      .populate("finishedProduct");

    res.status(201).json(populated);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to create production order",
    });
  }
};

export const getProductions = async (req: AuthRequest, res: Response) => {
  try {
    const productions = await Production.find()
      .populate("bom")
      .populate("finishedProduct", "name sku")
      .populate("createdBy", "name")
      .sort({
        createdAt: -1,
      });

    res.json(productions);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch production orders",
    });
  }
};

export const getProductionById = async (req: AuthRequest, res: Response) => {
  try {
    const production = await Production.findById(req.params.id)
      .populate("bom")
      .populate("finishedProduct", "name sku")
      .populate("createdBy", "name");

    if (!production) {
      return res.status(404).json({
        message: "Production order not found",
      });
    }

    res.json(production);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch production order",
    });
  }
};

export const updateProduction = async (req: AuthRequest, res: Response) => {
  try {
    const {
      bom,
      quantity,
      team,
      status,
      targetDate,
      notes,
      actualQuantity,
      completedAt,
      remarks,
    } = req.body;

    const existingBOM = await BOM.findById(bom);

    if (!existingBOM) {
      return res.status(404).json({
        message: "BOM not found",
      });
    }

    const production = await Production.findByIdAndUpdate(
      req.params.id,
      {
        bom,

        finishedProduct: existingBOM.finishedProduct,

        quantity,

        team,

        status,

        targetDate,

        notes,

        actualQuantity,

        completedAt,

        remarks,
      },
      {
        new: true,
      },
    )
      .populate("bom")
      .populate("finishedProduct")
      .populate("createdBy", "name");

    if (!production) {
      return res.status(404).json({
        message: "Production order not found",
      });
    }

    if (status === "Completed") {

  const bomData = await BOM.findById(bom)
  .populate("materials.product");
  if (bomData) {

    await MaterialConsumption.deleteMany({
      production: production._id,
    });

    const consumption = bomData.materials.map((item: any) => ({
      production: production._id,
      material: item.product._id,
      requiredQuantity: item.quantity * production.quantity,
    }));

    await MaterialConsumption.insertMany(consumption);

  }

}

    res.json(production);
  } catch (error: any) {
  console.error(error);

  res.status(500).json({
    message: error.message,
    error,
  });
}
};

export const getMaterialConsumption = async (
  req: AuthRequest,
  res: Response
) => {
  try {

    const records = await MaterialConsumption.find({
      production: req.params.id,
    }).populate("material", "name unit");

    res.json(records);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: "Failed to fetch material consumption",
    });

  }
};

export const deleteProduction = async (req: AuthRequest, res: Response) => {
  try {
    const production = await Production.findByIdAndDelete(req.params.id);

    if (!production) {
      return res.status(404).json({
        message: "Production order not found",
      });
    }

    res.json({
      message: "Production order deleted",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to delete production order",
    });
  }
};

export const calculateProduction = async (req: AuthRequest, res: Response) => {
  try {
    const { bom, quantity } = req.body;

    if (!bom || !quantity) {
      return res.status(400).json({
        message: "BOM and quantity are required.",
      });
    }

    const result = await calculateMaterialAvailability(bom, Number(quantity));

    res.json(result);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to calculate production.",
    });
  }
};
