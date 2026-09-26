import { Response } from "express";

import { AuthRequest } from "../middlewares/auth.middleware";

import Production from "../models/Production";
import Product from "../models/Product";
import BOM from "../models/BOM";
import MaterialConsumption from "../models/MaterialConsumption";
import AccountParty from "../models/AccountParty";
import ProductionClient from "../models/ProductionClient";
import Order from "../models/Order";

import {
  calculateMaterialAvailability,
} from "../utils/production.utils";

/*
 * Populate production orders consistently.
 *
 * Product information is included so CRM and Production
 * can see the relevant product details.
 */
const populateProduction = (query: any) => {
  return query
    .populate(
      "crmOrder",
      "orderNumber totalAmount status customer items notes createdAt"
    )
    .populate("client")
    .populate("createdBy", "name")
    .populate({
      path: "items.catalogueProduct",
      select:
        "name modelNumber marka image images category productType bom price unit moq isActive",
    })
    .populate({
      path: "items.product",
      select:
        "name sku unit currentStock image marka category type warehouse",
      populate: {
        path: "category",
        select: "name",
      },
    })
    .populate({
      path: "items.existingStockProduct",
      select:
        "name sku unit currentStock image type warehouse category",
      populate: {
        path: "category",
        select: "name",
      },
    })
    .populate("items.bom")
    .populate(
      "items.materialSelections.requiredMaterial",
      "name sku unit currentStock image"
    )
    .populate(
      "items.materialSelections.selectedMaterial",
      "name sku unit currentStock image"
    );
};

/*
 * PRODUCTION EXECUTION HELPERS
 *
 * Ordered quantity is immutable. Fulfilment is calculated from:
 * actual produced + existing finished stock.
 *
 * Production never deducts inventory. Dispatch owns stock movement.
 */
const toNonNegativeNumber = (value: any) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
};

/**
 * Validate an existing finished-stock allocation without changing inventory.
 * Inventory is deducted only by Dispatch when stock is actually dispatched.
 */
const validateExistingStockAllocation = async (
  productId: any,
  quantity: any
) => {
  const requestedQuantity = Number(quantity);

  if (!Number.isFinite(requestedQuantity) || requestedQuantity < 0) {
    const error: any = new Error(
      "Existing stock quantity must be a non-negative number"
    );
    error.statusCode = 400;
    throw error;
  }

  if (requestedQuantity === 0) {
    return null;
  }

  if (!productId) {
    const error: any = new Error(
      "Existing stock product is required when existing stock quantity is greater than 0"
    );
    error.statusCode = 400;
    throw error;
  }

  const product = await Product.findById(productId);

  if (!product) {
    const error: any = new Error(
      "Existing stock inventory product not found"
    );
    error.statusCode = 404;
    throw error;
  }

  if (product.type !== "FINISHED") {
    const error: any = new Error(
      "Existing stock can only be taken from a FINISHED inventory product"
    );
    error.statusCode = 400;
    throw error;
  }

  if (Number(product.currentStock || 0) < requestedQuantity) {
    const error: any = new Error(
      "Insufficient existing finished stock"
    );
    error.statusCode = 400;
    error.availableStock = Number(product.currentStock || 0);
    error.requestedQuantity = requestedQuantity;
    throw error;
  }

  return product;
};

const getOrderedQuantity = (item: any) =>
  Math.max(0, Number(item?.quantity) || 0);

const getActualQuantity = (item: any) =>
  Math.min(
    getOrderedQuantity(item),
    toNonNegativeNumber(item?.actualQuantity)
  );

const getExistingStockQuantity = (item: any) =>
  Math.min(
    Math.max(0, getOrderedQuantity(item) - getActualQuantity(item)),
    toNonNegativeNumber(item?.existingStockQuantity)
  );

const getAvailableQuantity = (item: any) =>
  Math.min(
    getOrderedQuantity(item),
    getActualQuantity(item) + getExistingStockQuantity(item)
  );

const getReadyQuantity = (item: any) =>
  Math.min(
    getAvailableQuantity(item),
    toNonNegativeNumber(item?.readyForDispatchQuantity)
  );

const isItemFullyFulfilled = (item: any) =>
  getOrderedQuantity(item) > 0 &&
  getAvailableQuantity(item) >= getOrderedQuantity(item);

const isItemReadyForDispatch = (item: any) =>
  getOrderedQuantity(item) > 0 &&
  getReadyQuantity(item) >= getOrderedQuantity(item);

const recalculateProductionItemState = (item: any) => {
  const ordered = getOrderedQuantity(item);
  const actual = Math.min(
    ordered,
    toNonNegativeNumber(item?.actualQuantity)
  );
  const stock = Math.min(
    Math.max(0, ordered - actual),
    toNonNegativeNumber(item?.existingStockQuantity)
  );
  const available = Math.min(ordered, actual + stock);
  const ready = Math.min(
    available,
    toNonNegativeNumber(item?.readyForDispatchQuantity)
  );

  item.actualQuantity = actual;
  item.existingStockQuantity = stock;

  if (stock <= 0) {
    item.existingStockProduct = null;
  }

  item.readyForDispatchQuantity = ready;
  item.completed = ordered > 0 && available >= ordered;
  item.readyForDispatch = ready > 0;

  return {
    ordered,
    actual,
    stock,
    available,
    ready,
    remaining: Math.max(0, ordered - available),
  };
};

const getProductionAggregate = (production: any) => {
  const items = Array.isArray(production?.items)
    ? production.items
    : [];

  const totalOrdered = items.reduce(
    (sum: number, item: any) => sum + getOrderedQuantity(item),
    0
  );
  const totalAvailable = items.reduce(
    (sum: number, item: any) => sum + getAvailableQuantity(item),
    0
  );
  const totalReady = items.reduce(
    (sum: number, item: any) => sum + getReadyQuantity(item),
    0
  );

  const allFulfilled =
    items.length > 0 && items.every(isItemFullyFulfilled);

  const allReady =
    items.length > 0 && items.every(isItemReadyForDispatch);

  const anyProgress = items.some(
    (item: any) =>
      getAvailableQuantity(item) > 0 ||
      getReadyQuantity(item) > 0 ||
      item.completed === true ||
      item.readyForDispatch === true ||
      item.checklist?.preparing?.length > 0 ||
      item.checklist?.leaving?.length > 0
  );

  return {
    totalOrdered,
    totalAvailable,
    totalReady,
    totalRemaining: Math.max(0, totalOrdered - totalAvailable),
    allFulfilled,
    allReady,
    anyProgress,
  };
};

const syncProductionAndOrderStatus = async (production: any) => {
  const aggregate = getProductionAggregate(production);

  if (aggregate.allFulfilled) {
    production.status = "Completed";
    production.completedAt = production.completedAt || new Date();
  } else if (aggregate.anyProgress) {
    production.status = "In Progress";
    production.completedAt = undefined;
  }

  if (production.crmOrder) {
    const order = await Order.findById(production.crmOrder);

    if (order) {
      const orderItems = Array.isArray(order.items) ? order.items : [];
      const productionItems = Array.isArray(production.items)
        ? production.items
        : [];

      const allFulfilled =
        orderItems.length > 0 &&
        orderItems.every((orderItem: any) => {
          const productionItem = productionItems.find(
            (item: any) =>
              String(item.catalogueProduct) ===
              String(orderItem.catalogueProduct)
          );
          return productionItem && isItemFullyFulfilled(productionItem);
        });

      const allReady =
        orderItems.length > 0 &&
        orderItems.every((orderItem: any) => {
          const productionItem = productionItems.find(
            (item: any) =>
              String(item.catalogueProduct) ===
              String(orderItem.catalogueProduct)
          );
          return productionItem && isItemReadyForDispatch(productionItem);
        });

      const anyFulfilled = productionItems.some(
        (item: any) => getAvailableQuantity(item) > 0
      );

      if (allReady || allFulfilled) {
        order.status = "Ready for Dispatch";
      } else if (anyFulfilled) {
        order.status = "Partially Produced";
      } else {
        order.status = "In Production";
      }

      await order.save();
    }
  }

  return aggregate;
};

const rebuildMaterialConsumption = async (production: any) => {
  await MaterialConsumption.deleteMany({
    production: production._id,
  });

  const records: any[] = [];

  for (const productionItem of production.items as any[]) {
    const actualQuantity = getActualQuantity(productionItem);

    if (actualQuantity <= 0 || !productionItem.bom) {
      continue;
    }

    const bom = await BOM.findById(productionItem.bom);

    if (!bom) {
      continue;
    }

    for (const material of (bom.materials || []) as any[]) {
      records.push({
        production: production._id,
        productionItem: productionItem._id,
        material: material.product,
        requiredQuantity:
          Number(material.quantity) * actualQuantity,
      });
    }
  }

  if (records.length > 0) {
    await MaterialConsumption.insertMany(records);
  }
};

/*
 * CREATE PRODUCTION ORDER
 *
 * CRM / FOUNDER responsibility.
 *
 * Production staff do not create orders.
 */
export const createProduction = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const {
      client,
      clientModel,
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

    const resolvedClientModel =
      clientModel || "ProductionClient";

    if (
      ![
        "ProductionClient",
        "AccountParty",
      ].includes(resolvedClientModel)
    ) {
      return res.status(400).json({
        message: "Invalid client type",
      });
    }

    /*
     * AccountParty clients must be actual
     * CUSTOMER parties.
     */
    const clientExists =
      resolvedClientModel === "AccountParty"
        ? await AccountParty.findOne({
          _id: client,
          partyType: "CUSTOMER",
        })
        : await ProductionClient.findById(
          client
        );

    if (!clientExists) {
      return res.status(404).json({
        message: "Client not found",
      });
    }

    if (
      !Array.isArray(items) ||
      items.length === 0
    ) {
      return res.status(400).json({
        message:
          "At least one production item is required",
      });
    }

    /*
     * Validate every production item.
     */
    for (const item of items) {
      if (
        !item.product &&
        !item.catalogueProduct
      ) {
        return res.status(400).json({
          message:
            "Catalogue product or legacy inventory product is required for every item",
        });
      }

      const quantity = Number(item.quantity);

      if (
        !Number.isInteger(quantity) ||
        quantity <= 0
      ) {
        return res.status(400).json({
          message:
            "Valid quantity is required for every item",
        });
      }

      const existingStockQuantity =
        toNonNegativeNumber(item.existingStockQuantity);

      if (
        existingStockQuantity > 0 &&
        Number(item.quantity) < existingStockQuantity
      ) {
        return res.status(400).json({
          message:
            "Existing stock quantity cannot exceed ordered quantity",
        });
      }

      if (
        item.productType === "TRADING" &&
        item.bom
      ) {
        return res.status(400).json({
          message:
            "Trading products cannot have a BOM",
        });
      }

      try {
        await validateExistingStockAllocation(
          item.existingStockProduct,
          existingStockQuantity
        );
      } catch (error: any) {
        return res.status(error?.statusCode || 400).json({
          message:
            error?.message ||
            "Invalid existing stock allocation",
          ...(error?.availableStock !== undefined
            ? { availableStock: error.availableStock }
            : {}),
          ...(error?.requestedQuantity !== undefined
            ? { requestedQuantity: error.requestedQuantity }
            : {}),
        });
      }

      if (item.bom) {
        const bom = await BOM.findById(item.bom);

        if (!bom) {
          return res.status(404).json({
            message: "BOM not found",
          });
        }
      }
    }

    /*
     * Generate production order number.
     */
    const count =
      (await Production.countDocuments()) + 1;

    const orderNumber =
      `PROD-${new Date().getFullYear()}-${String(
        count
      ).padStart(3, "0")}`;

    /*
     * Create production order.
     *
     * Image, marka, category, price and
     * importantNotes are stored on the
     * production item as order-level data.
     */
    const production =
      await Production.create({
        orderNumber,

        client,

        clientModel:
          resolvedClientModel,

        items: items.map(
          (item: any) => ({
            product:
              item.product || null,

            catalogueProduct:
              item.catalogueProduct || null,

            productType:
              item.productType ||
              (item.bom ? "MANUFACTURING" : "TRADING"),

            modelNumber:
              item.modelNumber || "",

            bom:
              item.bom || null,

            /*
             * Product/order information
             */
            image:
              item.image || "",

            marka:
              item.marka || "",

            category:
              item.category || "",

            price:
              Number(item.price || 0),

            importantNotes:
              item.importantNotes || "",

            /*
             * Production quantity
             */
            quantity:
              Number(item.quantity),

            /*
             * Material selection
             */
            materialSelections:
              item.materialSelections ||
              [],

            /*
             * Production checklist
             */
            checklist: {
              preparing:
                item.checklist?.preparing ||
                [],

              leaving:
                item.checklist?.leaving ||
                [],

              reason:
                item.checklist?.reason ||
                "",
            },

            /*
             * Execution fields start empty.
             */
            actualQuantity:
              item.actualQuantity ??
              null,

            existingStockProduct:
              item.existingStockProduct || null,

            existingStockQuantity:
              toNonNegativeNumber(
                item.existingStockQuantity
              ),

            readyForDispatchQuantity:
              toNonNegativeNumber(
                item.readyForDispatchQuantity
              ),

            completed:
              false,

            readyForDispatch:
              false,

            remarks:
              item.remarks || "",
          })
        ),

        team:
          team || "Unassigned",

        status:
          "Draft",

        targetDate,

        transport:
          transport || "",

        notes:
          notes || "",

        createdBy:
          req.user?.userId,
      });

    const populated =
      await populateProduction(
        Production.findById(
          production._id
        )
      );

    return res
      .status(201)
      .json(populated);
  } catch (error: any) {
    console.error(
      "CREATE PRODUCTION ERROR:",
      error
    );

    return res.status(500).json({
      message:
        error?.message ||
        "Failed to create production order",
    });
  }
};

/*
 * GET ALL PRODUCTION ORDERS
 *
 * Both CRM and Production can read
 * production orders according to their
 * frontend permissions.
 */
/*
 * CREATE PRODUCTION FROM AN EXISTING CRM ORDER
 *
 * CRM owns the order. Production receives a linked execution record.
 *
 * The actual creation logic lives in the reusable internal helper below.
 * This keeps ONE source of truth for:
 * - CRM → Production item mapping
 * - Trading vs Manufacturing handling
 * - BOM validation
 * - Production creation
 * - CRM order linking
 * - CRM order status transition
 *
 * The HTTP handler remains available for the production route.
 */

/*
 * Small internal error helper.
 *
 * The reusable function below is also called by the CRM Order controller,
 * so it cannot directly send an Express response. Instead it throws an
 * error carrying an HTTP status code (and, for duplicate production, the
 * existing production record).
 */
const createProductionError = (
  message: string,
  statusCode: number,
  extra?: Record<string, any>
) => {
  const error: any = new Error(message);

  error.statusCode = statusCode;

  if (extra) {
    Object.assign(error, extra);
  }

  return error;
};

/*
 * REUSABLE CRM ORDER → PRODUCTION CREATION
 *
 * This function is intentionally exported because order.controller.ts
 * needs to trigger the exact same production workflow.
 *
 * createdBy is optional because the CRM controller currently uses the
 * normal Express Request type. When an authenticated user id is available,
 * it is stored on the Production record.
 */
export const createProductionFromOrderInternal = async (
  order: any,
  createdBy?: string
) => {
  if (!order) {
    throw createProductionError(
      "CRM order not found",
      404
    );
  }

  if (order.status === "Cancelled") {
    throw createProductionError(
      "Cancelled orders cannot be sent to production",
      400
    );
  }

  if (
    order.status !== "Confirmed" &&
    order.status !== "Pending"
  ) {
    throw createProductionError(
      "Only pending or confirmed CRM orders can be sent to production",
      400
    );
  }

  const existing = await Production.findOne({
    crmOrder: order._id,
  });

  if (existing) {
    const existingProduction =
      await populateProduction(
        Production.findById(existing._id)
      );

    throw createProductionError(
      "Production already exists for this CRM order",
      409,
      {
        production: existingProduction,
      }
    );
  }

  const customer = await AccountParty.findOne({
    _id: order.customer,
    partyType: "CUSTOMER",
  });

  if (!customer) {
    throw createProductionError(
      "CRM order customer is not a valid Account customer",
      400
    );
  }

  if (
    !Array.isArray(order.items) ||
    order.items.length === 0
  ) {
    throw createProductionError(
      "CRM order contains no items",
      400
    );
  }

  /*
   * The COMPLETE CRM Order enters Production.
   *
   * Manufacturing items can have a BOM and participate in material
   * calculations.
   *
   * Trading items remain visible in Production but have no BOM and
   * never enter manufacturing/material calculations.
   *
   * Manufacturing products without a BOM are also allowed; they remain
   * visible and can still be fulfilled through production/stock tracking.
   */
  const productionItems = order.items.map(
    (item: any) => ({
      product: null,

      catalogueProduct:
        item.catalogueProduct,

      productType:
        item.productType,

      modelNumber:
        item.modelNumber || "",

      bom:
        item.productType === "TRADING"
          ? null
          : item.bom || null,

      image:
        item.image || "",

      marka:
        item.marka || "",

      category: "",

      price:
        Number(item.unitPrice || 0),

      importantNotes:
        order.notes || "",

      quantity:
        Number(item.quantity),

      materialSelections: [],

      checklist: {
        preparing: [],
        leaving: [],
        reason: "",
      },

      actualQuantity: null,

      existingStockQuantity: 0,

      readyForDispatchQuantity: 0,

      completed: false,

      readyForDispatch: false,

      remarks: "",
    })
  );

  for (const item of productionItems) {
    if (
      !Number.isInteger(Number(item.quantity)) ||
      Number(item.quantity) <= 0
    ) {
      throw createProductionError(
        "Every CRM order item must have a valid quantity",
        400
      );
    }

    if (item.bom) {
      const bom = await BOM.findById(item.bom);

      if (!bom) {
        throw createProductionError(
          "BOM not found for a CRM order item",
          404
        );
      }
    }
  }

  const count =
    (await Production.countDocuments()) + 1;

  const production =
    await Production.create({
      orderNumber:
        `PROD-${new Date().getFullYear()}-${String(
          count
        ).padStart(3, "0")}`,

      crmOrder: order._id,

      client: customer._id,

      clientModel: "AccountParty",

      items: productionItems,

      team: "Unassigned",

      status: "Draft",

      targetDate:
        new Date(
          Date.now() + 7 * 24 * 60 * 60 * 1000
        ),

      transport: "",

      notes:
        `Created from CRM Order ${order.orderNumber}${
          order.notes
            ? ` — ${order.notes}`
            : ""
        }`,

      createdBy:
        createdBy || undefined,
    });

  /*
   * Bidirectional workflow link:
   *
   * CRM Order → Production
   * Production → CRM Order
   */
  order.production = production._id;
  order.status = "In Production";

  await order.save();

  return await populateProduction(
    Production.findById(production._id)
  );
};

/*
 * HTTP HANDLER
 *
 * This remains available for the existing Production route.
 */
export const createProductionFromOrder = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        message: "CRM order not found",
      });
    }

    const production =
      await createProductionFromOrderInternal(
        order,
        req.user?.userId
      );

    return res.status(201).json(production);
  } catch (error: any) {
    console.error(
      "CREATE PRODUCTION FROM ORDER ERROR:",
      error
    );

    return res.status(
      error?.statusCode || 500
    ).json({
      message:
        error?.message ||
        "Failed to create production from CRM order",
      ...(error?.production
        ? {
            production:
              error.production,
          }
        : {}),
    });
  }
};

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

    return res.json(
      productions
    );
  } catch (error) {
    console.error(
      "GET PRODUCTIONS ERROR:",
      error
    );

    return res.status(500).json({
      message:
        "Failed to fetch production orders",
    });
  }
};

/*
 * GET SINGLE PRODUCTION ORDER
 */
export const getProductionById =
  async (
    req: AuthRequest,
    res: Response
  ) => {
    try {
      const production =
        await populateProduction(
          Production.findById(
            req.params.id
          )
        );

      if (!production) {
        return res.status(404).json({
          message:
            "Production order not found",
        });
      }

      return res.json(
        production
      );
    } catch (error) {
      console.error(
        "GET PRODUCTION ERROR:",
        error
      );

      return res.status(500).json({
        message:
          "Failed to fetch production order",
      });
    }
  };

/*
 * UPDATE WHOLE PRODUCTION ORDER
 *
 * CRM / FOUNDER responsibility.
 *
 * Production staff must use the item-update
 * endpoint for execution/progress changes.
 */
export const updateProduction =
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

      const {
        client,
        clientModel,
        items,
        team,
        status,
        targetDate,
        transport,
        notes,
      } = req.body;

      /*
       * Update client.
       */
      if (
        client !== undefined
      ) {
        const resolvedClientModel =
          clientModel ||
          production.clientModel ||
          "ProductionClient";

        if (
          ![
            "ProductionClient",
            "AccountParty",
          ].includes(
            resolvedClientModel
          )
        ) {
          return res.status(400).json({
            message:
              "Invalid client type",
          });
        }

        const clientExists =
          resolvedClientModel ===
            "AccountParty"
            ? await AccountParty.findOne({
              _id: client,
              partyType:
                "CUSTOMER",
            })
            : await ProductionClient.findById(
              client
            );

        if (!clientExists) {
          return res.status(404).json({
            message:
              "Client not found",
          });
        }

        production.client =
          client;

        production.clientModel =
          resolvedClientModel;
      }

      /*
       * Update general order fields.
       */
      if (
        team !== undefined
      ) {
        production.team =
          team;
      }

      if (
        status !== undefined
      ) {
        production.status =
          status;
      }

      if (
        targetDate !== undefined
      ) {
        production.targetDate =
          targetDate;
      }

      if (
        transport !== undefined
      ) {
        production.transport =
          transport;
      }

      if (
        notes !== undefined
      ) {
        production.notes =
          notes;
      }

      /*
       * Replace production items
       * only when items are supplied.
       */
      if (Array.isArray(items)) {
        for (
          const item of items
        ) {
          if (
            !item.product &&
            !item.catalogueProduct
          ) {
            return res.status(400).json({
              message:
                "Catalogue product or legacy inventory product is required for every item",
            });
          }

          if (
            !Number.isInteger(
              Number(item.quantity)
            ) ||
            Number(item.quantity) <= 0
          ) {
            return res.status(400).json({
              message:
                "Valid quantity is required for every item",
            });
          }

          const existingStockQuantity =
            toNonNegativeNumber(item.existingStockQuantity);

          if (
            existingStockQuantity >
            Number(item.quantity)
          ) {
            return res.status(400).json({
              message:
                "Existing stock quantity cannot exceed ordered quantity",
            });
          }

          if (
            item.productType === "TRADING" &&
            item.bom
          ) {
            return res.status(400).json({
              message:
                "Trading products cannot have a BOM",
            });
          }

          try {
            await validateExistingStockAllocation(
              item.existingStockProduct,
              existingStockQuantity
            );
          } catch (error: any) {
            return res.status(error?.statusCode || 400).json({
              message:
                error?.message ||
                "Invalid existing stock allocation",
              ...(error?.availableStock !== undefined
                ? { availableStock: error.availableStock }
                : {}),
              ...(error?.requestedQuantity !== undefined
                ? { requestedQuantity: error.requestedQuantity }
                : {}),
            });
          }

          if (item.bom) {
            const bom =
              await BOM.findById(item.bom);

            if (!bom) {
              return res.status(404).json({
                message:
                  "BOM not found",
              });
            }
          }
        }

        production.set(
          "items",
          items.map(
            (item: any) => ({
              _id:
                item._id,

              product:
                item.product || null,

              catalogueProduct:
                item.catalogueProduct || null,

              productType:
                item.productType ||
                (item.bom ? "MANUFACTURING" : "TRADING"),

              modelNumber:
                item.modelNumber || "",

              bom:
                item.bom || null,

              /*
               * CRM order information
               */
              image:
                item.image || "",

              marka:
                item.marka || "",

              category:
                item.category || "",

              price:
                Number(
                  item.price || 0
                ),

              importantNotes:
                item.importantNotes ||
                "",

              /*
               * Quantity
               */
              quantity:
                Number(
                  item.quantity
                ),

              /*
               * Material selection
               */
              materialSelections:
                item.materialSelections ||
                [],

              /*
               * Existing production
               * progress information.
               */
              checklist: {
                preparing:
                  item.checklist
                    ?.preparing ||
                  [],

                leaving:
                  item.checklist
                    ?.leaving ||
                  [],

                reason:
                  item.checklist
                    ?.reason ||
                  "",

                updatedAt:
                  item.checklist
                    ?.updatedAt ||
                  null,
              },

              actualQuantity:
                item.actualQuantity ??
                null,

              existingStockProduct:
                item.existingStockProduct || null,

              existingStockQuantity:
                item.existingStockQuantity ??
                0,

              readyForDispatchQuantity:
                item.readyForDispatchQuantity ??
                0,

              completed:
                item.completed ??
                false,

              readyForDispatch:
                item.readyForDispatch ??
                false,

              remarks:
                item.remarks ||
                "",
            })
          )
        );
      }

      /*
       * Normalize every execution quantity while preserving ordered quantity.
       */
      for (const productionItem of production.items as any[]) {
        recalculateProductionItemState(productionItem);
      }

      await syncProductionAndOrderStatus(production);

      await rebuildMaterialConsumption(production);

      await production.save();

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
      console.error(
        "UPDATE PRODUCTION ERROR:",
        error
      );

      return res.status(500).json({
        message:
          error?.message ||
          "Failed to update production order",
      });
    }
  };

/*
 * UPDATE SINGLE PRODUCTION ITEM
 *
 * Production staff use this endpoint.
 *
 * Allowed:
 * - material selections
 * - preparing / leaving checklist
 * - reason
 * - actual quantity
 * - completed
 * - ready for dispatch
 * - production remarks
 *
 * CRM order information such as image,
 * marka, price and product is NOT modified
 * here.
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
        existingStockProduct,
        existingStockQuantity,
        readyForDispatchQuantity,
        completed,
        readyForDispatch,
        remarks,
      } = req.body;

      if (materialSelections !== undefined) {
        item.materialSelections =
          Array.isArray(materialSelections)
            ? materialSelections
            : [];
      }

      if (checklist !== undefined) {
        item.checklist = {
          preparing:
            Array.isArray(checklist?.preparing)
              ? checklist.preparing
              : [],

          leaving:
            Array.isArray(checklist?.leaving)
              ? checklist.leaving
              : [],

          reason:
            String(checklist?.reason || ""),

          updatedAt: new Date(),
        };
      }

      if (actualQuantity !== undefined) {
        const ordered =
          getOrderedQuantity(item);
        const parsed =
          Number(actualQuantity);

        if (
          !Number.isFinite(parsed) ||
          parsed < 0
        ) {
          return res.status(400).json({
            message:
              "Actual produced quantity must be a non-negative number",
          });
        }

        item.actualQuantity =
          Math.min(ordered, parsed);
      }

      if (
        existingStockProduct !== undefined ||
        existingStockQuantity !== undefined
      ) {
        const ordered =
          getOrderedQuantity(item);

        const actual =
          Math.min(
            ordered,
            toNonNegativeNumber(
              item.actualQuantity
            )
          );

        const parsedQuantity =
          existingStockQuantity !== undefined
            ? Number(existingStockQuantity)
            : toNonNegativeNumber(
                item.existingStockQuantity
              );

        if (
          !Number.isFinite(parsedQuantity) ||
          parsedQuantity < 0
        ) {
          return res.status(400).json({
            message:
              "Existing stock quantity must be a non-negative number",
          });
        }

        const cappedQuantity = Math.min(
          Math.max(0, ordered - actual),
          parsedQuantity
        );

        const selectedStockProduct =
          existingStockProduct !== undefined
            ? existingStockProduct
            : item.existingStockProduct;

        try {
          await validateExistingStockAllocation(
            selectedStockProduct,
            cappedQuantity
          );
        } catch (error: any) {
          return res.status(error?.statusCode || 400).json({
            message:
              error?.message ||
              "Invalid existing stock allocation",
            ...(error?.availableStock !== undefined
              ? { availableStock: error.availableStock }
              : {}),
            ...(error?.requestedQuantity !== undefined
              ? { requestedQuantity: error.requestedQuantity }
              : {}),
          });
        }

        item.existingStockProduct =
          cappedQuantity > 0
            ? selectedStockProduct || null
            : null;

        item.existingStockQuantity =
          cappedQuantity;
      }

      /*
       * If actual quantity was supplied without stock, normalize stock
       * against the new actual quantity. This preserves the invariant:
       * actual + existing stock <= ordered.
       */
      recalculateProductionItemState(item);

      if (readyForDispatchQuantity !== undefined) {
        const available =
          getAvailableQuantity(item);
        const parsed =
          Number(readyForDispatchQuantity);

        if (
          !Number.isFinite(parsed) ||
          parsed < 0
        ) {
          return res.status(400).json({
            message:
              "Ready-for-dispatch quantity must be a non-negative number",
          });
        }

        item.readyForDispatchQuantity =
          Math.min(available, parsed);
      }

      if (completed !== undefined) {
        item.completed =
          Boolean(completed);
      }

      if (
        readyForDispatch !== undefined &&
        readyForDispatchQuantity === undefined
      ) {
        if (readyForDispatch) {
          item.readyForDispatchQuantity =
            getAvailableQuantity(item);
        } else {
          item.readyForDispatchQuantity = 0;
        }
      }

      if (remarks !== undefined) {
        item.remarks =
          String(remarks || "");
      }

      /*
       * Quantity-derived state is authoritative.
       * This prevents "Completed" from being stored when the order is
       * still short of its original ordered quantity.
       */
      recalculateProductionItemState(item);

      await syncProductionAndOrderStatus(
        production
      );

      await rebuildMaterialConsumption(
        production
      );

      await production.save();

      const populated =
        await populateProduction(
          Production.findById(
            production._id
          )
        );

      return res.json(populated);
    } catch (error: any) {
      console.error(
        "UPDATE PRODUCTION ITEM ERROR:",
        error
      );

      return res.status(500).json({
        message:
          error?.message ||
          "Failed to update production item",
      });
    }
  };

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
            "name sku unit image"
          )
          .sort({
            createdAt: 1,
          });

      return res.json(
        records
      );
    } catch (error) {
      console.error(
        "GET MATERIAL CONSUMPTION ERROR:",
        error
      );

      return res.status(500).json({
        message:
          "Failed to fetch material consumption",
      });
    }
  };

/*
 * DELETE PRODUCTION ORDER
 *
 * CRM / FOUNDER responsibility.
 *
 * Production staff cannot delete orders.
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
       * Remove production-side
       * consumption records too.
       *
       * This does NOT touch inventory.
       */
      await MaterialConsumption.deleteMany(
        {
          production:
            production._id,
        }
      );

      if (production.crmOrder) {
        const linkedOrder = await Order.findById(
          production.crmOrder
        );

        if (linkedOrder) {
          linkedOrder.production = null;

          if (linkedOrder.status === "In Production") {
            linkedOrder.status = "Confirmed";
          }

          await linkedOrder.save();
        }
      }

      await Production.findByIdAndDelete(
        production._id
      );

      return res.json({
        message:
          "Production order deleted",
      });
    } catch (error) {
      console.error(
        "DELETE PRODUCTION ERROR:",
        error
      );

      return res.status(500).json({
        message:
          "Failed to delete production order",
      });
    }
  };

/*
 * CAPACITY CALCULATOR
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

      if (
        !bom ||
        !quantity
      ) {
        return res.status(400).json({
          message:
            "BOM and quantity are required.",
        });
      }

      const result =
        await calculateMaterialAvailability(
          bom,
          Number(
            quantity
          ),
          materialSelections ||
          []
        );

      return res.json(
        result
      );
    } catch (error: any) {
      console.error(
        "CALCULATE PRODUCTION ERROR:",
        error
      );

      return res.status(500).json({
        message:
          error?.message ||
          "Failed to calculate production.",
      });
    }
  };

/*
 * UPLOAD PRODUCTION ORDER IMAGE
 *
 * The route must attach the Cloudinary
 * upload middleware before this controller.
 *
 * Expected:
 * multipart/form-data
 * field name: image
 *
 * Returns:
 * {
 *   image: "cloudinary-url"
 * }
 */
export const uploadProductionImage =
  async (
    req: AuthRequest,
    res: Response
  ) => {
    try {
      const file =
        (req as any).file;

      if (!file) {
        return res.status(400).json({
          message:
            "Image is required",
        });
      }

      return res.json({
        image:
          file.path,
      });
    } catch (error: any) {
      console.error(
        "UPLOAD PRODUCTION IMAGE ERROR:",
        error
      );

      return res.status(500).json({
        message:
          error?.message ||
          "Failed to upload production image",
      });
    }
  };