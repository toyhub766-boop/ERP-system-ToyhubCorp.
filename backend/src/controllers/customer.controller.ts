import {
  Request,
  Response,
} from "express";

import {
  AuthRequest,
} from "../middlewares/auth.middleware";

import Customer from "../models/customer";


// ==============================
// GET ALL CUSTOMERS
// ==============================

export const getCustomers = async (
  req: Request,
  res: Response
) => {
  try {
    const customers =
      await Customer.find()
        .populate(
          "stageHistory.changedBy",
          "name employeeId"
        )
        .sort({
          createdAt: -1,
        });

    return res.json(customers);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message:
        "Failed to fetch customers",
    });
  }
};


// ==============================
// GET ONE CUSTOMER
// ==============================

export const getCustomerById = async (
  req: Request,
  res: Response
) => {
  try {
    const customer =
      await Customer.findById(
        req.params.id
      ).populate(
        "stageHistory.changedBy",
        "name employeeId"
      );

    if (!customer) {
      return res.status(404).json({
        message:
          "Customer not found",
      });
    }

    return res.json(customer);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message:
        "Failed to fetch customer",
    });
  }
};


// ==============================
// CREATE CUSTOMER
// ==============================

export const createCustomer = async (
  req: Request,
  res: Response
) => {
  try {
    const count =
      await Customer.countDocuments();

    const initialStage =
      req.body.stage || "LEAD";

    const customer =
      await Customer.create({
        customerCode:
          `CUST-${String(
            count + 1
          ).padStart(3, "0")}`,

        companyName:
          req.body.companyName,

        contactPerson:
          req.body.contactPerson,

        phone:
          req.body.phone,

        email:
          req.body.email || "",

        address:
          req.body.address || "",

        city:
          req.body.city || "",

        state:
          req.body.state || "",

        pincode:
          req.body.pincode || "",

        gstNumber:
          req.body.gstNumber || "",

        billingName:
          req.body.billingName || "",

        station:
          req.body.station || "",

        packingCharges:
          Number(
            req.body.packingCharges || 0
          ),

        transportCharges:
          Number(
            req.body.transportCharges || 0
          ),

        paymentTerms:
          Number(
            req.body.paymentTerms || 0
          ),

        stage:
          initialStage,

        category:
          req.body.category ||
          "OTHER",

        assignedSalesperson:
          req.body.assignedSalesperson ||
          "",

        lastContactDate:
          req.body.lastContactDate ||
          null,

        nextFollowUpDate:
          req.body.nextFollowUpDate ||
          null,

        nextAction:
          req.body.nextAction || "",

        negotiationNotes:
          req.body.negotiationNotes ||
          "",

        stageHistory: [
          {
            stage: initialStage,
            changedAt: new Date(),
            note:
              "Lead created",
          },
        ],

        reminderDate:
          req.body.reminderDate ||
          null,

        reminderSet:
          req.body.reminderSet ||
          false,

        specialNotes:
          req.body.specialNotes ||
          [],

        partyType:
          req.body.partyType ||
          "CUSTOMER",

        openingBalance:
          Number(
            req.body.openingBalance || 0
          ),

        currentBalance:
          Number(
            req.body.currentBalance || 0
          ),

        status:
          req.body.status ||
          "Active",
      });

    return res.status(201).json(
      customer
    );
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message:
        "Failed to create customer",
    });
  }
};


// ==============================
// UPDATE CUSTOMER
// ==============================

export const updateCustomer = async (
  req: Request,
  res: Response
) => {
  try {
    const existing =
      await Customer.findById(
        req.params.id
      );

    if (!existing) {
      return res.status(404).json({
        message:
          "Customer not found",
      });
    }

    const updateData = {
      ...req.body,

      packingCharges:
        Number(
          req.body.packingCharges || 0
        ),

      transportCharges:
        Number(
          req.body.transportCharges || 0
        ),

      paymentTerms:
        Number(
          req.body.paymentTerms || 0
        ),

      openingBalance:
        Number(
          req.body.openingBalance || 0
        ),

      currentBalance:
        Number(
          req.body.currentBalance || 0
        ),
    };

    const customer =
      await Customer.findByIdAndUpdate(
        req.params.id,
        updateData,
        {
          new: true,
          runValidators: true,
        }
      );

    return res.json(
      customer
    );
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message:
        "Failed to update customer",
    });
  }
};


// ==============================
// DELETE CUSTOMER
// ==============================

export const deleteCustomer = async (
  req: Request,
  res: Response
) => {
  try {
    const customer =
      await Customer.findByIdAndDelete(
        req.params.id
      );

    if (!customer) {
      return res.status(404).json({
        message:
          "Customer not found",
      });
    }

    return res.json({
      message:
        "Customer deleted",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message:
        "Failed to delete customer",
    });
  }
};


// ==============================
// UPDATE SALES PIPELINE
// ==============================

export const updateCustomerPipeline =
  async (
    req: AuthRequest,
    res: Response
  ) => {
    try {
      const customer =
        await Customer.findById(
          req.params.id
        );

      if (!customer) {
        return res.status(404).json({
          message:
            "Customer not found",
        });
      }

      const {
        stage,
        assignedSalesperson,
        lastContactDate,
        nextFollowUpDate,
        nextAction,
        negotiationNotes,
        stageNote,
      } = req.body;

      const stageChanged =
        stage &&
        stage !== customer.stage;

      if (stageChanged) {
        customer.stage =
          stage;

        customer.stageHistory.push(
          {
            stage,
            changedAt:
              new Date(),

            changedBy:
              req.user?.userId,

            note:
              stageNote || "",
          } as any
        );
      }

      if (
        assignedSalesperson !==
        undefined
      ) {
        customer.assignedSalesperson =
          assignedSalesperson;
      }

      if (
        lastContactDate !==
        undefined
      ) {
        customer.lastContactDate =
          lastContactDate ||
          undefined;
      }

      if (
        nextFollowUpDate !==
        undefined
      ) {
        customer.nextFollowUpDate =
          nextFollowUpDate ||
          undefined;
      }

      if (
        nextAction !==
        undefined
      ) {
        customer.nextAction =
          nextAction;
      }

      if (
        negotiationNotes !==
        undefined
      ) {
        customer.negotiationNotes =
          negotiationNotes;
      }

      await customer.save();

      const updated =
        await Customer.findById(
          customer._id
        ).populate(
          "stageHistory.changedBy",
          "name employeeId"
        );

      return res.json(
        updated
      );
    } catch (error) {
      console.error(error);

      return res.status(500).json({
        message:
          "Failed to update sales pipeline",
      });
    }
  };


// ==============================
// GET SALES PIPELINE
// ==============================

// ==============================
// GET SALES PIPELINE
// ==============================

export const getSalesPipeline =
  async (
    req: Request,
    res: Response
  ) => {
    try {
      const customers =
        await Customer.find()
          .populate(
            "stageHistory.changedBy",
            "name employeeId"
          )
          .sort({
            nextFollowUpDate: 1,
            createdAt: -1,
          });

      return res.json(customers);
    } catch (error) {
      console.error(error);

      return res.status(500).json({
        message:
          "Failed to fetch sales pipeline",
      });
    }
  };


// ==============================
// ADD CUSTOMER NOTE
// ==============================

export const addCustomerNote = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const customer =
      await Customer.findById(
        req.params.id
      );

    if (!customer) {
      return res.status(404).json({
        message:
          "Customer not found",
      });
    }

    customer.specialNotes.unshift(
      {
        title:
          req.body.title,

        note:
          req.body.note,

        type:
          req.body.type ||
          "GENERAL",

        priority:
          req.body.priority ||
          "MEDIUM",

        reminderDate:
          req.body.reminderDate,

        completed:
          false,

        addedBy:
          req.user?.userId,

        createdAt:
          new Date(),
      } as any
    );

    await customer.save();

    return res.status(201).json(
      customer
    );
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message:
        "Failed to add note",
    });
  }
};


// ==============================
// UPDATE CUSTOMER NOTE
// ==============================

export const updateCustomerNote =
  async (
    req: Request,
    res: Response
  ) => {
    try {
      const customer =
        await Customer.findById(
          req.params.id
        );

      if (!customer) {
        return res.status(404).json({
          message:
            "Customer not found",
        });
      }

      const note =
        customer.specialNotes.find(
          (item: any) =>
            item._id.toString() ===
            req.params.noteId
        );

      if (!note) {
        return res.status(404).json({
          message:
            "Note not found",
        });
      }

      Object.assign(
        note,
        req.body
      );

      await customer.save();

      return res.json(
        customer
      );
    } catch (error) {
      console.error(error);

      return res.status(500).json({
        message:
          "Failed to update note",
      });
    }
  };


// ==============================
// DELETE CUSTOMER NOTE
// ==============================

export const deleteCustomerNote =
  async (
    req: Request,
    res: Response
  ) => {
    try {
      const customer =
        await Customer.findById(
          req.params.id
        );

      if (!customer) {
        return res.status(404).json({
          message:
            "Customer not found",
        });
      }

      customer.specialNotes =
        customer.specialNotes.filter(
          (note: any) =>
            note._id.toString() !==
            req.params.noteId
        ) as any;

      await customer.save();

      return res.json({
        message:
          "Note deleted",
      });
    } catch (error) {
      console.error(error);

      return res.status(500).json({
        message:
          "Failed to delete note",
      });
    }
  };