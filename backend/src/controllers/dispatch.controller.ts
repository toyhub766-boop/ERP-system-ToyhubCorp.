import { Response } from "express";
import Dispatch from "../models/Dispatch";
import Production from "../models/Production";
import { AuthRequest } from "../middlewares/auth.middleware";

export const createDispatch = async (req: AuthRequest, res: Response) => {
  try {
    const { production, quantity, destination, vehicleNumber, notes } =
      req.body;

    const existingProduction = await Production.findById(production);

    if (!existingProduction) {
      return res.status(404).json({
        message: "Production order not found",
      });
    }

    if (existingProduction.status !== "Completed") {
      return res.status(400).json({
        message: "Only completed production orders can be dispatched",
      });
    }

    const dispatch = await Dispatch.create({
      production,
      quantity,
      destination,
      vehicleNumber,
      notes,
      dispatchedBy: req.user?.userId,
      dispatchedAt: new Date(),
      status: "Dispatched",
    });

    res.status(201).json(dispatch);
  } catch (error: any) {
  console.error("Dispatch Error:", error);

  return res.status(500).json({
    message: error.message,
    stack: error.stack,
  });
}
};

export const updateDispatch = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const dispatch =
      await Dispatch.findByIdAndUpdate(
        req.params.id,
        req.body,
        {
          new: true,
          runValidators: true,
        }
      )
        .populate({
          path: "production",
          populate: [
            {
              path: "items.product",
              select: "name productCode",
            },
            {
              path: "client",
              select: "name companyName",
            },
          ],
        })
        .populate(
          "dispatchedBy",
          "name employeeId"
        );

    if (!dispatch) {
      return res.status(404).json({
        message: "Dispatch not found",
      });
    }

    return res.json(dispatch);

  } catch (error: any) {
    console.error(
      "UPDATE DISPATCH ERROR:",
      error
    );

    return res.status(500).json({
      message: error.message,
    });
  }
};

export const getDispatches = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const dispatches = await Dispatch.find()
      .populate({
        path: "production",
        populate: [
          {
            path: "items.product",
            select: "name productCode",
          },
          {
            path: "client",
            select: "name companyName",
          },
        ],
      })
      .populate("dispatchedBy", "name employeeId")
      .sort({ createdAt: -1 });

    return res.json(dispatches);
  } catch (error: any) {
    console.error("GET DISPATCH ERROR:", error);

    return res.status(500).json({
      message: "Failed to fetch dispatch records",
      error: error.message,
    });
  }
};
