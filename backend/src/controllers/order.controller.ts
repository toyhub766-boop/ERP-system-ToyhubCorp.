import { Request, Response } from "express";
import { AuthRequest } from "../middlewares/auth.middleware";

import Order from "../models/Order";
import Catalogue from "../models/Catalogue";
import AccountParty from "../models/AccountParty";
import Production from "../models/Production";
import MaterialConsumption from "../models/MaterialConsumption";
import {
  createProductionFromOrderInternal,
} from "./production.controller";

// ============================================================
// HELPER — GENERATE ORDER NUMBER
// ============================================================

const generateOrderNumber = async () => {
  const lastOrder = await Order.findOne()
    .sort({ createdAt: -1 });

  let nextNumber = 1;

  if (lastOrder?.orderNumber) {
    const current = parseInt(
      lastOrder.orderNumber.replace("ORD-", ""),
      10
    );

    if (!Number.isNaN(current)) {
      nextNumber = current + 1;
    }
  }

  return `ORD-${String(nextNumber).padStart(4, "0")}`;
};

// ============================================================
// HELPER — POPULATE ORDER
// ============================================================

const populateOrder = (query: any) => {
  return query
    .populate("production")
    .populate("customer")
    .populate({
      path: "items.catalogueProduct",
      select:
        "name description category image images modelNumber marka price unit moq productType bom isActive",
    })
    .populate({
      path: "items.bom",
      select: "finishedProduct materials",
      populate: {
        path: "finishedProduct",
        select: "name sku unit image",
      },
    });
};

// ============================================================
// GET ALL ORDERS
// ============================================================

export const getOrders = async (
  req: Request,
  res: Response
) => {
  try {
    const orders = await populateOrder(
      Order.find().sort({
        createdAt: -1,
      })
    );

    return res.status(200).json(orders);
  } catch (error) {
    console.error(
      "GET ORDERS ERROR:",
      error
    );

    return res.status(500).json({
      message: "Failed to fetch orders.",
    });
  }
};

// ============================================================
// GET SINGLE ORDER
// ============================================================

export const getOrderById = async (
  req: Request,
  res: Response
) => {
  try {
    const order = await populateOrder(
      Order.findById(req.params.id)
    );

    if (!order) {
      return res.status(404).json({
        message: "Order not found.",
      });
    }

    return res.status(200).json(order);
  } catch (error) {
    console.error(
      "GET ORDER ERROR:",
      error
    );

    return res.status(500).json({
      message: "Failed to fetch order.",
    });
  }
};

// ============================================================
// GET ORDERS BY CUSTOMER
// ============================================================

export const getOrdersByCustomer = async (
  req: Request,
  res: Response
) => {
  try {
    const customer =
      await AccountParty.findById(
        req.params.customerId
      );

    if (!customer) {
      return res.status(404).json({
        message: "Customer not found.",
      });
    }

    if (
      customer.partyType !== "CUSTOMER"
    ) {
      return res.status(400).json({
        message:
          "Selected party is not a customer.",
      });
    }

    const orders = await populateOrder(
      Order.find({
        customer:
          req.params.customerId,
      }).sort({
        createdAt: -1,
      })
    );

    return res.status(200).json(orders);
  } catch (error) {
    console.error(
      "GET CUSTOMER ORDERS ERROR:",
      error
    );

    return res.status(500).json({
      message:
        "Failed to fetch customer orders.",
    });
  }
};

// ============================================================
// CREATE ORDER
// ============================================================

export const createOrder = async (
  req: Request,
  res: Response
) => {
  try {
    const {
      customer,
      items,
      notes,
    } = req.body;

    // --------------------------------------------------------
    // CUSTOMER VALIDATION
    // --------------------------------------------------------

    if (!customer) {
      return res.status(400).json({
        message: "Customer is required.",
      });
    }

    const accountParty =
      await AccountParty.findById(
        customer
      );

    if (!accountParty) {
      return res.status(404).json({
        message: "Customer not found.",
      });
    }

    if (
      accountParty.partyType !==
      "CUSTOMER"
    ) {
      return res.status(400).json({
        message:
          "Selected party is not a customer.",
      });
    }

    // --------------------------------------------------------
    // ITEMS VALIDATION
    // --------------------------------------------------------

    if (
      !Array.isArray(items) ||
      items.length === 0
    ) {
      return res.status(400).json({
        message:
          "At least one order item is required.",
      });
    }

    // --------------------------------------------------------
    // BUILD ORDER ITEMS
    // --------------------------------------------------------

    const orderItems: any[] = [];

    let totalAmount = 0;

    for (const item of items) {
      if (!item.catalogueProduct) {
        return res.status(400).json({
          message:
            "Every order item must have a catalogue product.",
        });
      }

      // ------------------------------------------------------
      // GET CURRENT CATALOGUE PRODUCT
      // ------------------------------------------------------

      const catalogue =
        await Catalogue.findById(
          item.catalogueProduct
        );

      if (!catalogue) {
        return res.status(404).json({
          message:
            "One or more catalogue products were not found.",
        });
      }

      if (!catalogue.isActive) {
        return res.status(400).json({
          message:
            `Product "${catalogue.name}" is inactive and cannot be ordered.`,
        });
      }

      // ------------------------------------------------------
      // QUANTITY
      // ------------------------------------------------------

      const quantity = Number(
        item.quantity
      );

      if (
        !Number.isInteger(quantity) ||
        quantity < 1
      ) {
        return res.status(400).json({
          message:
            `Invalid quantity for "${catalogue.name}".`,
        });
      }

      // ------------------------------------------------------
      // MOQ
      // ------------------------------------------------------

      const moq =
        Number(catalogue.moq) || 1;

      if (quantity < moq) {
        return res.status(400).json({
          message:
            `"${catalogue.name}" has a minimum order quantity of ${moq}.`,
        });
      }

      if (quantity % moq !== 0) {
        return res.status(400).json({
          message:
            `Quantity for "${catalogue.name}" must be a multiple of ${moq}.`,
        });
      }

      // ------------------------------------------------------
      // PRICE
      // ------------------------------------------------------

      const unitPrice =
        Number(catalogue.price) || 0;

      const totalPrice =
        quantity * unitPrice;

      // ------------------------------------------------------
      // BOM
      // ------------------------------------------------------

      let bomId =
        catalogue.bom || null;

      // Trading products can never carry a BOM.
      if (
        catalogue.productType ===
        "TRADING"
      ) {
        bomId = null;
      }

      // ------------------------------------------------------
      // SNAPSHOT
      // ------------------------------------------------------

      const orderItem = {
        catalogueProduct:
          catalogue._id,

        name: catalogue.name,

        modelNumber:
          catalogue.modelNumber || "",

        marka:
          catalogue.marka || "",

        image:
          catalogue.image || "",

        productType:
          catalogue.productType,

        bom: bomId,

        moq,

        quantity,

        unitPrice,

        totalPrice,
      };

      orderItems.push(orderItem);

      totalAmount += totalPrice;
    }

    // --------------------------------------------------------
    // ORDER NUMBER
    // --------------------------------------------------------

    const orderNumber =
      await generateOrderNumber();

    // --------------------------------------------------------
    // CREATE
    // --------------------------------------------------------

    const order = await Order.create({
      customer:
        accountParty._id,

      orderNumber,

      items: orderItems,

      totalAmount,

      status: "Pending",

      notes: notes || "",
    });

    // --------------------------------------------------------
    // RETURN POPULATED ORDER
    // --------------------------------------------------------

    const populatedOrder =
      await populateOrder(
        Order.findById(order._id)
      );

    return res.status(201).json(
      populatedOrder
    );
  } catch (error: any) {
    console.error(
      "CREATE ORDER ERROR:"
    );

    console.error(error);

    return res.status(500).json({
      message:
        error?.message ||
        "Failed to create order.",
    });
  }
};

// ============================================================
// UPDATE ORDER
// ============================================================

export const updateOrder = async (
  req: Request,
  res: Response
) => {
  try {
    const order =
      await Order.findById(
        req.params.id
      );

    if (!order) {
      return res.status(404).json({
        message: "Order not found.",
      });
    }

    // --------------------------------------------------------
    // STATUS / NOTES ONLY
    // --------------------------------------------------------
    //
    // Order item modification should not silently
    // rewrite historical catalogue snapshots.
    //
    // Item changes will be handled explicitly later
    // if required by the CRM workflow.
    // --------------------------------------------------------

    if (
      req.body.status !== undefined
    ) {
      const allowedStatuses = [
        "Pending",
        "Confirmed",
        "In Production",
        "Partially Produced",
        "Ready for Dispatch",
        "Partially Dispatched",
        "Dispatched",
        "Delivered",
        "Cancelled",
      ];

      if (
        !allowedStatuses.includes(
          req.body.status
        )
      ) {
        return res.status(400).json({
          message:
            "Invalid order status.",
        });
      }

      order.status =
        req.body.status;
    }

    if (
      req.body.notes !== undefined
    ) {
      order.notes =
        req.body.notes;
    }

    await order.save();

    const updatedOrder =
      await populateOrder(
        Order.findById(order._id)
      );

    return res.status(200).json(
      updatedOrder
    );
  } catch (error: any) {
    console.error(
      "UPDATE ORDER ERROR:",
      error
    );

    return res.status(500).json({
      message:
        error?.message ||
        "Failed to update order.",
    });
  }
};

// ============================================================
// DELETE LINKED PRODUCTION
// ============================================================

const deleteLinkedProduction = async (order: any) => {
  const productionId =
    typeof order?.production === "object"
      ? order.production?._id
      : order?.production;

  const production = productionId
    ? await Production.findById(productionId)
    : await Production.findOne({ crmOrder: order._id });

  if (!production) return null;

  await MaterialConsumption.deleteMany({
    production: production._id,
  });

  await Production.findByIdAndDelete(production._id);

  return production;
};

// ============================================================
// DELETE SINGLE ORDER
// ============================================================

export const deleteOrder = async (
  req: Request,
  res: Response
) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        message: "Order not found.",
      });
    }

    const linkedProduction = await deleteLinkedProduction(order);

    await Order.findByIdAndDelete(order._id);

    return res.status(200).json({
      message: linkedProduction
        ? "Order and linked Production order deleted successfully."
        : "Order deleted successfully.",
      orderId: order._id,
      orderNumber: order.orderNumber,
      orderValue: order.totalAmount,
      productionId: linkedProduction?._id || null,
    });
  } catch (error) {
    console.error("DELETE ORDER ERROR:", error);

    return res.status(500).json({
      message: "Failed to delete order.",
    });
  }
};

// ============================================================
// DELETE MULTIPLE ORDERS
// ============================================================

export const deleteOrdersBulk = async (
  req: Request,
  res: Response
) => {
  try {
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        message: "Order IDs are required.",
      });
    }

    const orders = await Order.find({
      _id: { $in: ids },
    }).select("_id orderNumber totalAmount production");

    if (orders.length === 0) {
      return res.status(404).json({
        message: "No matching orders found.",
      });
    }

    const orderIds = orders.map((order) => order._id);
    const productionIds = new Set<string>();

    const linkedProductions = await Production.find({
      $or: [
        { crmOrder: { $in: orderIds } },
        { _id: { $in: orders.map((order) => order.production).filter(Boolean) } },
      ],
    }).select("_id");

    linkedProductions.forEach((production) => {
      productionIds.add(String(production._id));
    });

    if (productionIds.size > 0) {
      const idsToDelete = Array.from(productionIds);

      await MaterialConsumption.deleteMany({
        production: { $in: idsToDelete },
      });

      await Production.deleteMany({
        _id: { $in: idsToDelete },
      });
    }

    await Order.deleteMany({
      _id: { $in: orderIds },
    });

    return res.status(200).json({
      message: "Orders and linked Production orders deleted successfully.",
      deletedOrders: orders.map((order) => ({
        orderId: order._id,
        orderNumber: order.orderNumber,
        orderValue: order.totalAmount,
      })),
      deletedProductionCount: productionIds.size,
      deletedCount: orders.length,
    });
  } catch (error) {
    console.error("BULK DELETE ORDERS ERROR:", error);

    return res.status(500).json({
      message: "Failed to delete orders.",
    });
  }
};


export const sendOrderToProduction = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        message: "Order not found.",
      });
    }

    /*
     * CRM workflow:
     *
     * Pending
     *   ↓ Confirm
     * Confirmed
     *   ↓ Send to Production
     * In Production
     *
     * Sending an order directly from Pending is intentionally blocked.
     * The Confirm action is the explicit CRM approval step.
     */
    if (order.status !== "Confirmed") {
      return res.status(400).json({
        message:
          "Only confirmed orders can be sent to production.",
      });
    }

    if (order.production) {
      return res.status(400).json({
        message:
          "This order has already been sent to production.",
        productionId: order.production,
      });
    }

    /*
     * Use the SAME production creation workflow as the Production
     * controller. This avoids maintaining two separate implementations.
     *
     * The helper:
     * - validates the CRM order
     * - validates the AccountParty customer
     * - copies every CRM item
     * - keeps Trading items visible without BOM
     * - validates Manufacturing BOMs
     * - creates the Production record
     * - links Production back to this CRM Order
     * - changes the CRM Order to In Production
     */
    const createdBy = req.user?.userId;

    if (!createdBy) {
      return res.status(401).json({
        message:
          "Authenticated user is required to send an order to production.",
      });
    }

    const production =
      await createProductionFromOrderInternal(
        order,
        createdBy
      );

    const populatedOrder =
      await populateOrder(
        Order.findById(order._id)
      );

    return res.status(201).json({
      message:
        "Order sent to production successfully.",
      order: populatedOrder,
      production,
    });
  } catch (error: any) {
    console.error(
      "SEND ORDER TO PRODUCTION ERROR:",
      error
    );

    return res.status(
      error?.statusCode || 500
    ).json({
      message:
        error?.message ||
        "Failed to send order to production.",
      ...(error?.production
        ? {
            production:
              error.production,
          }
        : {}),
    });
  }
};

