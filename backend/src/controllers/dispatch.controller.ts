import { Response } from "express";

import Dispatch from "../models/Dispatch";
import Production from "../models/Production";
import Order from "../models/Order";
import {
  addStockToInventory,
  removeStockFromInventory,
} from "./inventory.controller";

import { AuthRequest } from "../middlewares/auth.middleware";

/* -------------------------------------------------------------------------- */
/* HELPERS                                                                    */
/* -------------------------------------------------------------------------- */

const toNonNegativeNumber = (value: unknown): number => {
  const parsed = Number(value);

  return Number.isFinite(parsed) && parsed > 0
    ? parsed
    : 0;
};

const getOrderedQuantity = (item: any): number => {
  return Math.max(0, Number(item?.quantity) || 0);
};

const getActualQuantity = (item: any): number => {
  const ordered = getOrderedQuantity(item);

  return Math.min(
    ordered,
    toNonNegativeNumber(item?.actualQuantity),
  );
};

const getExistingStockQuantity = (item: any): number => {
  const ordered = getOrderedQuantity(item);
  const actual = getActualQuantity(item);

  return Math.min(
    Math.max(0, ordered - actual),
    toNonNegativeNumber(item?.existingStockQuantity),
  );
};

const getAvailableQuantity = (item: any): number => {
  const ordered = getOrderedQuantity(item);
  const actual = getActualQuantity(item);
  const existingStock = getExistingStockQuantity(item);

  return Math.min(
    ordered,
    actual + existingStock,
  );
};

const getReadyQuantity = (item: any): number => {
  return Math.min(
    getAvailableQuantity(item),
    toNonNegativeNumber(
      item?.readyForDispatchQuantity,
    ),
  );
};

const getItemName = (item: any): string => {
  return (
    item?.catalogueProduct?.name ||
    item?.product?.name ||
    item?.name ||
    "Product"
  );
};

const getItemModel = (item: any): string => {
  return (
    item?.modelNumber ||
    item?.catalogueProduct?.modelNumber ||
    item?.product?.sku ||
    item?.sku ||
    ""
  );
};

const getItemMarka = (item: any): string => {
  return (
    item?.marka ||
    item?.catalogueProduct?.marka ||
    item?.product?.marka ||
    ""
  );
};

/**
 * Sum all already-created dispatches for one Production item.
 *
 * Dispatches are transaction records, therefore this is the
 * authoritative dispatched quantity.
 */
const getDispatchedQuantity = async (
  productionId: string,
  productionItemId: string,
): Promise<number> => {
  const result = await Dispatch.aggregate([
    {
      $match: {
        production: productionId,
        productionItem: productionItemId,
        status: {
          $in: ["Dispatched", "Delivered"],
        },
      },
    },
    {
      $group: {
        _id: null,
        quantity: {
          $sum: "$quantity",
        },
      },
    },
  ]);

  return Number(result[0]?.quantity || 0);
};

/**
 * Calculate complete Dispatch-side balance.
 *
 * Ordered = original CRM quantity.
 * Available = Production-ready quantity.
 * Dispatched = completed Dispatch transactions.
 * Remaining = original order quantity - dispatched quantity.
 *
 * We intentionally do not overwrite Production.quantity.
 */
const getDispatchBalance = async (
  production: any,
  item: any,
) => {
  const ordered = getOrderedQuantity(item);
  const available = getReadyQuantity(item);

  const dispatched = await getDispatchedQuantity(
    production._id.toString(),
    item._id.toString(),
  );

  const remaining = Math.max(
    0,
    ordered - dispatched,
  );

  const dispatchable = Math.max(
    0,
    Math.min(
      available - dispatched,
      remaining,
    ),
  );

  return {
    ordered,
    available,
    dispatched,
    remaining,
    dispatchable,
  };
};

/**
 * Resolve the user performing the operation.
 */
const getAuthenticatedUserId = (
  req: AuthRequest,
): string | null => {
  return req.user?.userId
    ? String(req.user.userId)
    : null;
};

/* -------------------------------------------------------------------------- */
/* PRODUCTION / ORDER STATUS                                                  */
/* -------------------------------------------------------------------------- */

/**
 * Synchronize CRM Order status after a Dispatch.
 *
 * Production remains the execution source.
 * CRM Order remains the commercial source.
 */
const syncOrderStatusAfterDispatch = async (
  production: any,
): Promise<void> => {
  if (!production.crmOrder) {
    return;
  }

  const order = await Order.findById(
    production.crmOrder,
  );

  if (!order) {
    return;
  }

  const allItems = Array.isArray(production.items)
    ? production.items
    : [];

  if (allItems.length === 0) {
    return;
  }

  let totalOrdered = 0;
  let totalDispatched = 0;

  for (const item of allItems) {
    const ordered = getOrderedQuantity(item);

    totalOrdered += ordered;

    const dispatched =
      await getDispatchedQuantity(
        production._id.toString(),
        item._id.toString(),
      );

    totalDispatched += dispatched;
  }

  if (totalDispatched <= 0) {
    return;
  }

  if (totalDispatched >= totalOrdered) {
    order.status = "Dispatched";
  } else {
    order.status = "Partially Dispatched";
  }

  await order.save();
};

/* -------------------------------------------------------------------------- */
/* CREATE DISPATCH                                                            */
/* -------------------------------------------------------------------------- */

/**
 * Create one partial Dispatch transaction.
 *
 * Required:
 * - production
 * - productionItem
 * - quantity
 * - destination
 *
 * Optional:
 * - vehicleNumber
 * - cartonPhotos
 * - challanPhoto
 * - notes
 */
export const createDispatch = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    const {
      production,
      productionItem,
      quantity,
      destination,
      vehicleNumber,
      cartonPhotos,
      challanPhoto,
      notes,
    } = req.body;

    /* ---------------------------------------------------------------------- */
    /* AUTHENTICATION                                                         */
    /* ---------------------------------------------------------------------- */

    const dispatchedBy =
      getAuthenticatedUserId(req);

    if (!dispatchedBy) {
      return res.status(401).json({
        message:
          "Authenticated user is required",
      });
    }

    /* ---------------------------------------------------------------------- */
    /* BASIC VALIDATION                                                       */
    /* ---------------------------------------------------------------------- */

    if (!production) {
      return res.status(400).json({
        message:
          "Production order is required",
      });
    }

    if (!productionItem) {
      return res.status(400).json({
        message:
          "Production item is required",
      });
    }

    const parsedQuantity = Number(quantity);

    if (
      !Number.isFinite(parsedQuantity) ||
      parsedQuantity <= 0
    ) {
      return res.status(400).json({
        message:
          "Dispatch quantity must be greater than zero",
      });
    }

    if (
      !destination ||
      typeof destination !== "string" ||
      !destination.trim()
    ) {
      return res.status(400).json({
        message:
          "Dispatch destination is required",
      });
    }

    /* ---------------------------------------------------------------------- */
    /* FIND PRODUCTION                                                        */
    /* ---------------------------------------------------------------------- */

    const existingProduction =
      await Production.findById(production);

    if (!existingProduction) {
      return res.status(404).json({
        message:
          "Production order not found",
      });
    }

    /* ---------------------------------------------------------------------- */
    /* FIND PRODUCTION ITEM                                                   */
    /* ---------------------------------------------------------------------- */

    const item: any =
      (existingProduction.items as any[]).find(
        (entry: any) =>
          String(entry?._id) ===
          String(productionItem),
      );

    if (!item) {
      return res.status(404).json({
        message:
          "Production item not found",
      });
    }

    /* ---------------------------------------------------------------------- */
    /* CALCULATE DISPATCH BALANCE                                             */
    /* ---------------------------------------------------------------------- */

    const balance =
      await getDispatchBalance(
        existingProduction,
        item,
      );

    /* ---------------------------------------------------------------------- */
    /* READY CHECK                                                            */
    /* ---------------------------------------------------------------------- */

    if (balance.available <= 0) {
      return res.status(400).json({
        message:
          "This production item has no quantity ready for dispatch.",
        ordered: balance.ordered,
        available: balance.available,
        dispatched: balance.dispatched,
        remaining: balance.remaining,
      });
    }

    if (balance.dispatchable <= 0) {
      return res.status(400).json({
        message:
          "No dispatchable quantity remains for this production item.",
        ordered: balance.ordered,
        available: balance.available,
        dispatched: balance.dispatched,
        remaining: balance.remaining,
      });
    }

    /* ---------------------------------------------------------------------- */
    /* PREVENT OVER-DISPATCH                                                  */
    /* ---------------------------------------------------------------------- */

    if (
      parsedQuantity >
      balance.dispatchable
    ) {
      return res.status(400).json({
        message:
          "Dispatch quantity exceeds the quantity currently ready for dispatch.",
        requestedQuantity: parsedQuantity,
        dispatchableQuantity:
          balance.dispatchable,
        ordered: balance.ordered,
        available: balance.available,
        dispatched: balance.dispatched,
        remaining: balance.remaining,
      });
    }

    /* ---------------------------------------------------------------------- */
    /* INVENTORY DEDUCTION                                                     */
    /* ---------------------------------------------------------------------- */

    // Existing finished stock is the inventory-backed source. Production
    // itself does not deduct inventory; the deduction happens only when
    // the quantity actually leaves through Dispatch.
    const existingStockQuantity = getExistingStockQuantity(item);
    const previouslyDispatched = balance.dispatched;
    const inventoryBackedDispatched = Math.min(
      previouslyDispatched,
      existingStockQuantity,
    );
    const inventoryBackedThisDispatch = Math.max(
      0,
      Math.min(
        parsedQuantity,
        existingStockQuantity - inventoryBackedDispatched,
      ),
    );

    if (inventoryBackedThisDispatch > 0) {
      const inventoryProductId = item?.existingStockProduct?._id
        ? String(item.existingStockProduct._id)
        : item?.existingStockProduct
          ? String(item.existingStockProduct)
          : null;

      if (!inventoryProductId) {
        return res.status(400).json({
          message:
            "This production item uses existing stock, but its inventory product is missing.",
        });
      }

      try {
        await removeStockFromInventory({
          productId: inventoryProductId,
          quantity: inventoryBackedThisDispatch,
          reason: "Dispatch",
          notes: `Dispatch from Production ${existingProduction._id}`,
          performedBy: dispatchedBy,
        });
      } catch (inventoryError: any) {
        return res.status(inventoryError?.statusCode || 400).json({
          message:
            inventoryError?.message ||
            "Failed to deduct inventory for dispatch.",
          ...(inventoryError?.availableStock !== undefined
            ? { availableStock: inventoryError.availableStock }
            : {}),
        });
      }
    }

    /* ---------------------------------------------------------------------- */
    /* CREATE DISPATCH                                                        */
    /* ---------------------------------------------------------------------- */

    let dispatch;

    try {
      dispatch = await Dispatch.create({
        production:
          existingProduction._id,

        productionItem:
          item._id,

        quantity:
          parsedQuantity,

        destination:
          destination.trim(),

        vehicleNumber:
          typeof vehicleNumber === "string"
            ? vehicleNumber.trim()
            : "",

        dispatchedBy,

        dispatchedAt:
          new Date(),

        status:
          "Dispatched",

        cartonPhotos:
          Array.isArray(cartonPhotos)
            ? cartonPhotos.filter(
                (photo: unknown) =>
                  typeof photo === "string" &&
                  photo.trim().length > 0,
              )
            : [],

        challanPhoto:
          typeof challanPhoto === "string"
            ? challanPhoto.trim()
            : "",

        notes:
          typeof notes === "string"
            ? notes.trim()
            : "",
      });
    } catch (dispatchError) {
      // If the Dispatch transaction itself fails after inventory was
      // deducted, restore the exact inventory quantity to avoid stock loss.
      if (inventoryBackedThisDispatch > 0) {
        const inventoryProductId = item?.existingStockProduct?._id
          ? String(item.existingStockProduct._id)
          : item?.existingStockProduct
            ? String(item.existingStockProduct)
            : null;

        if (inventoryProductId) {
          await addStockToInventory({
            productId: inventoryProductId,
            quantity: inventoryBackedThisDispatch,
            reason: "Dispatch Rollback",
            notes: `Rollback for failed Dispatch from Production ${existingProduction._id}`,
            performedBy: dispatchedBy,
          });
        }
      }

      throw dispatchError;
    }

    /* ---------------------------------------------------------------------- */
    /* UPDATE CRM ORDER STATUS                                                */
    /* ---------------------------------------------------------------------- */

    await syncOrderStatusAfterDispatch(
      existingProduction,
    );

    /* ---------------------------------------------------------------------- */
    /* RESPONSE                                                               */
    /* ---------------------------------------------------------------------- */

    const updatedBalance =
      await getDispatchBalance(
        existingProduction,
        item,
      );

    return res.status(201).json({
      dispatch,
      balance: updatedBalance,
      message:
        "Dispatch created successfully",
    });
  } catch (error: any) {
    console.error(
      "CREATE DISPATCH ERROR:",
      error,
    );

    return res.status(
      error?.statusCode || 500,
    ).json({
      message:
        error?.message ||
        "Failed to create dispatch",
    });
  }
};

/* -------------------------------------------------------------------------- */
/* UPDATE DISPATCH                                                            */
/* -------------------------------------------------------------------------- */

/**
 * Update operational information on a Dispatch.
 *
 * Quantity is intentionally NOT freely editable here.
 *
 * Changing an already-created transaction quantity would make
 * inventory/accounting reconciliation unsafe.
 *
 * If the quantity is wrong, create the correct transaction through
 * the appropriate correction workflow rather than silently mutating
 * the dispatch history.
 */
export const updateDispatch = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    const dispatch =
      await Dispatch.findById(
        req.params.id,
      );

    if (!dispatch) {
      return res.status(404).json({
        message:
          "Dispatch not found",
      });
    }

    const {
      destination,
      vehicleNumber,
      status,
      cartonPhotos,
      challanPhoto,
      notes,
    } = req.body;

    if (
      destination !== undefined &&
      (
        typeof destination !== "string" ||
        !destination.trim()
      )
    ) {
      return res.status(400).json({
        message:
          "Destination cannot be empty",
      });
    }

    if (
      status !== undefined &&
      ![
        "Pending",
        "Dispatched",
        "Delivered",
      ].includes(status)
    ) {
      return res.status(400).json({
        message:
          "Invalid dispatch status",
      });
    }

    if (
      destination !== undefined
    ) {
      dispatch.destination =
        destination.trim();
    }

    if (
      vehicleNumber !== undefined
    ) {
      dispatch.vehicleNumber =
        typeof vehicleNumber === "string"
          ? vehicleNumber.trim()
          : "";
    }

    if (
      cartonPhotos !== undefined
    ) {
      if (!Array.isArray(cartonPhotos)) {
        return res.status(400).json({
          message:
            "Carton photos must be an array",
        });
      }

      dispatch.cartonPhotos =
        cartonPhotos.filter(
          (photo: unknown) =>
            typeof photo === "string" &&
            photo.trim().length > 0,
        );
    }

    if (
      challanPhoto !== undefined
    ) {
      dispatch.challanPhoto =
        typeof challanPhoto === "string"
          ? challanPhoto.trim()
          : "";
    }

    if (notes !== undefined) {
      dispatch.notes =
        typeof notes === "string"
          ? notes.trim()
          : "";
    }

    if (status !== undefined) {
      dispatch.status = status;

      if (status === "Delivered") {
        dispatch.deliveredAt =
          dispatch.deliveredAt ||
          new Date();
      }

      if (status === "Dispatched") {
        dispatch.dispatchedAt =
          dispatch.dispatchedAt ||
          new Date();

        dispatch.deliveredAt = null;
      }

      if (status === "Pending") {
        dispatch.deliveredAt = null;
      }
    }

    await dispatch.save();

    const populated =
      await Dispatch.findById(
        dispatch._id,
      )
        .populate({
          path: "production",
          populate: [
            {
              path: "items.catalogueProduct",
              select:
                "name modelNumber marka image images productType",
            },
            {
              path: "items.product",
              select:
                "name sku unit currentStock image marka category type",
            },
            {
              path: "client",
              select:
                "name companyName firmName contactPerson phone",
            },
          ],
        })
        .populate(
          "dispatchedBy",
          "name employeeId",
        );

    return res.json(populated);
  } catch (error: any) {
    console.error(
      "UPDATE DISPATCH ERROR:",
      error,
    );

    return res.status(500).json({
      message:
        error?.message ||
        "Failed to update dispatch",
    });
  }
};

/* -------------------------------------------------------------------------- */
/* GET DISPATCHES                                                             */
/* -------------------------------------------------------------------------- */

export const getDispatches = async (
  _req: AuthRequest,
  res: Response,
) => {
  try {
    const dispatches =
      await Dispatch.find()
        .populate({
          path: "production",
          populate: [
            {
              path: "items.catalogueProduct",
              select:
                "name modelNumber marka image images productType",
            },
            {
              path: "items.product",
              select:
                "name sku unit currentStock image marka category type",
            },
            {
              path: "items.existingStockProduct",
              select:
                "name sku unit currentStock image type warehouse category",
            },
            {
              path: "client",
              select:
                "name companyName firmName contactPerson phone",
            },
            {
              path: "crmOrder",
              select:
                "orderNumber totalAmount status",
            },
          ],
        })
        .populate(
          "dispatchedBy",
          "name employeeId",
        )
        .sort({
          createdAt: -1,
        });

    return res.json(
      dispatches,
    );
  } catch (error: any) {
    console.error(
      "GET DISPATCH ERROR:",
      error,
    );

    return res.status(500).json({
      message:
        error?.message ||
        "Failed to fetch dispatch records",
    });
  }
};

/* -------------------------------------------------------------------------- */
/* GET SINGLE DISPATCH                                                        */
/* -------------------------------------------------------------------------- */

export const getDispatchById = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    const dispatch =
      await Dispatch.findById(
        req.params.id,
      )
        .populate({
          path: "production",
          populate: [
            {
              path: "items.catalogueProduct",
              select:
                "name modelNumber marka image images productType",
            },
            {
              path: "items.product",
              select:
                "name sku unit currentStock image marka category type",
            },
            {
              path: "items.existingStockProduct",
              select:
                "name sku unit currentStock image type warehouse category",
            },
            {
              path: "client",
              select:
                "name companyName firmName contactPerson phone",
            },
            {
              path: "crmOrder",
              select:
                "orderNumber totalAmount status",
            },
          ],
        })
        .populate(
          "dispatchedBy",
          "name employeeId",
        );

    if (!dispatch) {
      return res.status(404).json({
        message:
          "Dispatch not found",
      });
    }

    return res.json(dispatch);
  } catch (error: any) {
    console.error(
      "GET DISPATCH BY ID ERROR:",
      error,
    );

    return res.status(500).json({
      message:
        error?.message ||
        "Failed to fetch dispatch",
    });
  }
};

/* -------------------------------------------------------------------------- */
/* GET DISPATCH BALANCE FOR ONE PRODUCTION ITEM                              */
/* -------------------------------------------------------------------------- */

/**
 * Used by the Dispatch UI to display:
 *
 * Ordered
 * Available
 * Dispatched
 * Remaining
 *
 * and the exact quantity currently dispatchable.
 */
export const getDispatchBalanceForItem =
  async (
    req: AuthRequest,
    res: Response,
  ) => {
    try {
      const production =
        await Production.findById(
          req.params.productionId,
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
            String(entry?._id) ===
            String(req.params.itemId),
        );

      if (!item) {
        return res.status(404).json({
          message:
            "Production item not found",
        });
      }

      const balance =
        await getDispatchBalance(
          production,
          item,
        );

      return res.json({
        production: {
          _id: production._id,
          orderNumber:
            production.orderNumber,
          status:
            production.status,
        },

        item: {
          _id: item._id,
          name: getItemName(item),
          modelNumber:
            getItemModel(item),
          marka:
            getItemMarka(item),
          image:
            item.image ||
            item.catalogueProduct?.image ||
            item.product?.image ||
            "",
        },

        balance,
      });
    } catch (error: any) {
      console.error(
        "GET DISPATCH BALANCE ERROR:",
        error,
      );

      return res.status(500).json({
        message:
          error?.message ||
          "Failed to calculate dispatch balance",
      });
    }
  };

/* -------------------------------------------------------------------------- */
/* GET DISPATCH HISTORY FOR PRODUCTION ITEM                                  */
/* -------------------------------------------------------------------------- */

export const getDispatchesByProductionItem =
  async (
    req: AuthRequest,
    res: Response,
  ) => {
    try {
      const dispatches =
        await Dispatch.find({
          production:
            req.params.productionId,

          productionItem:
            req.params.itemId,
        })
          .populate(
            "dispatchedBy",
            "name employeeId",
          )
          .sort({
            createdAt: -1,
          });

      return res.json(
        dispatches,
      );
    } catch (error: any) {
      console.error(
        "GET PRODUCTION ITEM DISPATCH HISTORY ERROR:",
        error,
      );

      return res.status(500).json({
        message:
          error?.message ||
          "Failed to fetch dispatch history",
      });
    }
  };