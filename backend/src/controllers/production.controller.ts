import { Response } from "express";
import { AuthRequest } from "../middlewares/auth.middleware";

import Production from "../models/Production";
import BOM from "../models/BOM";
import MaterialConsumption from "../models/MaterialConsumption";

import {
  calculateMaterialAvailability,
} from "../utils/production.utils";

const populateProduction = (query: any) => {
  return query
    .populate("client")
    .populate("createdBy", "name")
    .populate(
      "items.product",
      "name sku unit currentStock"
    )
    .populate("items.bom")
    .populate(
      "items.materialSelections.requiredMaterial",
      "name sku unit currentStock"
    )
    .populate(
      "items.materialSelections.selectedMaterial",
      "name sku unit currentStock"
    );
};

/*
|--------------------------------------------------------------------------
| CREATE
|--------------------------------------------------------------------------
*/

export const createProduction = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const {
      client,
      items,
      team,
      targetDate,
      transport,
      notes,
    } = req.body;

    if (!client) {
      return res.status(400).json({
        message: "Client is required",
      });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        message:
          "At least one production item is required",
      });
    }

    for (const item of items) {
      if (!item.product || !item.bom) {
        return res.status(400).json({
          message:
            "Product and BOM are required for every item",
        });
      }

      if (
        !item.quantity ||
        Number(item.quantity) <= 0
      ) {
        return res.status(400).json({
          message:
            "Valid quantity is required for every item",
        });
      }

      const bom = await BOM.findById(item.bom);

      if (!bom) {
        return res.status(404).json({
          message: "BOM not found",
        });
      }
    }

    const count =
      (await Production.countDocuments()) + 1;

    const orderNumber =
      `PROD-${new Date().getFullYear()}-${String(
        count
      ).padStart(3, "0")}`;

    const production =
      await Production.create({
        orderNumber,

        client,

        items: items.map((item: any) => ({
          product: item.product,
          bom: item.bom,
          quantity: Number(item.quantity),

          materialSelections:
            item.materialSelections || [],

          checklist: {
            preparing:
              item.checklist?.preparing || [],

            leaving:
              item.checklist?.leaving || [],

            reason:
              item.checklist?.reason || "",
          },

          actualQuantity:
            item.actualQuantity ?? null,

          completed: false,

          readyForDispatch: false,

          remarks:
            item.remarks || "",
        })),

        team: team || "Unassigned",

        status: "Draft",

        targetDate,

        transport: transport || "",

        notes: notes || "",

        createdBy: req.user?.userId,
      });

    const populated =
      await populateProduction(
        Production.findById(
          production._id
        )
      );

    return res.status(201).json(
      populated
    );
  } catch (error: any) {
    console.error(error);

    return res.status(500).json({
      message:
        error.message ||
        "Failed to create production order",
    });
  }
};


/*
|--------------------------------------------------------------------------
| GET ALL
|--------------------------------------------------------------------------
*/

export const getProductions = async (
  _req: AuthRequest,
  res: Response
) => {
  try {
    const productions =
      await populateProduction(
        Production.find().sort({
          createdAt: -1,
        })
      );

    return res.json(productions);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message:
        "Failed to fetch production orders",
    });
  }
};


/*
|--------------------------------------------------------------------------
| GET ONE
|--------------------------------------------------------------------------
*/

export const getProductionById = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const production =
      await populateProduction(
        Production.findById(req.params.id)
      );

    if (!production) {
      return res.status(404).json({
        message:
          "Production order not found",
      });
    }

    return res.json(production);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message:
        "Failed to fetch production order",
    });
  }
};


/*
|--------------------------------------------------------------------------
| UPDATE WHOLE ORDER
|--------------------------------------------------------------------------
*/

export const updateProduction = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const production =
      await Production.findById(
        req.params.id
      );

    if (!production) {
      return res.status(404).json({
        message:
          "Production order not found",
      });
    }

    const {
      client,
      items,
      team,
      status,
      targetDate,
      transport,
      notes,
    } = req.body;

    if (client !== undefined) {
      production.client = client;
    }

    if (team !== undefined) {
      production.team = team;
    }

    if (status !== undefined) {
      production.status = status;
    }

    if (targetDate !== undefined) {
      production.targetDate = targetDate;
    }

    if (transport !== undefined) {
      production.transport = transport;
    }

    if (notes !== undefined) {
      production.notes = notes;
    }

    if (Array.isArray(items)) {
      for (const item of items) {
        if (!item.product || !item.bom) {
          return res.status(400).json({
            message:
              "Product and BOM are required for every item",
          });
        }

        const bom =
          await BOM.findById(item.bom);

        if (!bom) {
          return res.status(404).json({
            message: "BOM not found",
          });
        }
      }

      production.set(
        "items",
        items.map((item: any) => ({
          _id: item._id,

          product: item.product,

          bom: item.bom,

          quantity:
            Number(item.quantity),

          materialSelections:
            item.materialSelections || [],

          checklist: {
            preparing:
              item.checklist?.preparing || [],

            leaving:
              item.checklist?.leaving || [],

            reason:
              item.checklist?.reason || "",

            updatedAt:
              item.checklist?.updatedAt ||
              null,
          },

          actualQuantity:
            item.actualQuantity ?? null,

          completed:
            item.completed ?? false,

          readyForDispatch:
            item.readyForDispatch ?? false,

          remarks:
            item.remarks || "",
        }))
      );
    }

    if (
      production.status === "Completed" &&
      !production.completedAt
    ) {
      production.completedAt =
        new Date();
    }

    await production.save();

    const populated =
      await populateProduction(
        Production.findById(
          production._id
        )
      );

    return res.json(populated);
  } catch (error: any) {
    console.error(error);

    return res.status(500).json({
      message:
        error.message ||
        "Failed to update production order",
    });
  }
};


/*
|--------------------------------------------------------------------------
| UPDATE SINGLE ITEM
|--------------------------------------------------------------------------
*/

export const updateProductionItem =
  async (
    req: AuthRequest,
    res: Response
  ) => {
    try {
      const production =
        await Production.findById(
          req.params.id
        );

      if (!production) {
        return res.status(404).json({
          message:
            "Production order not found",
        });
      }

      const item: any =
        (production.items as any[]).find(
          (entry: any) =>
            entry._id?.toString() ===
            String(req.params.itemId)
        );

      if (!item) {
        return res.status(404).json({
          message:
            "Production item not found",
        });
      }

      const {
        materialSelections,
        checklist,
        actualQuantity,
        completed,
        readyForDispatch,
        remarks,
      } = req.body;

      if (
        materialSelections !==
        undefined
      ) {
        item.materialSelections =
          materialSelections;
      }

      if (checklist !== undefined) {
        item.checklist = {
          preparing:
            checklist.preparing || [],

          leaving:
            checklist.leaving || [],

          reason:
            checklist.reason || "",

          updatedAt: new Date(),
        };
      }

      if (
        actualQuantity !==
        undefined
      ) {
        item.actualQuantity =
          Number(actualQuantity);
      }

      if (
        completed !== undefined
      ) {
        item.completed =
          Boolean(completed);
      }

      if (
        readyForDispatch !==
        undefined
      ) {
        item.readyForDispatch =
          Boolean(
            readyForDispatch
          );
      }

      if (remarks !== undefined) {
        item.remarks = remarks;
      }

      /*
       * Determine order status
       * from item states.
       */

      const allCompleted =
        (production.items as any[]).length >
        0 &&
        (production.items as any[]).every(
          (entry: any) =>
            entry.completed === true
        );

      const anyStarted =
        (production.items as any[]).some(
          (entry: any) =>
            entry.checklist?.preparing
              ?.length > 0 ||
            entry.checklist?.leaving
              ?.length > 0
        );

      if (allCompleted) {
        production.status =
          "Completed";

        production.completedAt =
          new Date();
      } else if (anyStarted) {
        production.status =
          "In Progress";
      }

      await production.save();

      /*
       * IMPORTANT:
       *
       * This creates production records only.
       * It does NOT reduce Product.currentStock.
       */

      if (
        completed === true
      ) {
        const existing =
          await MaterialConsumption.find({
            production:
              production._id,
          });

        const alreadyRecorded =
          existing.some(
            (record: any) =>
              record.productionItem?.toString() ===
              item._id?.toString()
          );

        if (!alreadyRecorded) {
          const bom =
            await BOM.findById(
              item.bom
            );

          if (bom) {
            const records =
              bom.materials.map(
                (material: any) => ({
                  production:
                    production._id,

                  productionItem:
                    item._id,

                  material:
                    material.product,

                  requiredQuantity:
                    Number(
                      material.quantity
                    ) *
                    Number(
                      item.quantity
                    ),
                })
              );

            if (records.length > 0) {
              await MaterialConsumption.insertMany(
                records
              );
            }
          }
        }
      }

      const populated =
        await populateProduction(
          Production.findById(
            production._id
          )
        );

      return res.json(
        populated
      );
    } catch (error: any) {
      console.error(error);

      return res.status(500).json({
        message:
          error.message ||
          "Failed to update production item",
      });
    }
  };


/*
|--------------------------------------------------------------------------
| MATERIAL CONSUMPTION
|--------------------------------------------------------------------------
*/

export const getMaterialConsumption =
  async (
    req: AuthRequest,
    res: Response
  ) => {
    try {
      const records =
        await MaterialConsumption.find({
          production:
            req.params.id,
        })
          .populate(
            "material",
            "name sku unit"
          )
          .sort({
            createdAt: 1,
          });

      return res.json(records);
    } catch (error) {
      console.error(error);

      return res.status(500).json({
        message:
          "Failed to fetch material consumption",
      });
    }
  };


/*
|--------------------------------------------------------------------------
| DELETE
|--------------------------------------------------------------------------
*/

export const deleteProduction =
  async (
    req: AuthRequest,
    res: Response
  ) => {
    try {
      const production =
        await Production.findById(
          req.params.id
        );

      if (!production) {
        return res.status(404).json({
          message:
            "Production order not found",
        });
      }

      /*
       * Delete production records only.
       * Inventory remains untouched.
       */

      await MaterialConsumption.deleteMany({
        production:
          production._id,
      });

      await Production.findByIdAndDelete(
        production._id
      );

      return res.json({
        message:
          "Production order deleted",
      });
    } catch (error) {
      console.error(error);

      return res.status(500).json({
        message:
          "Failed to delete production order",
      });
    }
  };


/*
|--------------------------------------------------------------------------
| CAPACITY CALCULATOR
|--------------------------------------------------------------------------
*/

export const calculateProduction =
  async (
    req: AuthRequest,
    res: Response
  ) => {
    try {
      const {
        bom,
        quantity,
        materialSelections,
      } = req.body;

      if (!bom || !quantity) {
        return res.status(400).json({
          message:
            "BOM and quantity are required.",
        });
      }

      const result =
        await calculateMaterialAvailability(
          bom,
          Number(quantity),
          materialSelections || []
        );

      return res.json(result);
    } catch (error: any) {
      console.error(error);

      return res.status(500).json({
        message:
          error.message ||
          "Failed to calculate production.",
      });
    }
  };