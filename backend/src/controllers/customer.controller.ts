import {
  Request,
  Response,
} from "express";

import {
  AuthRequest,
} from "../middlewares/auth.middleware";

import Customer from "../models/customer";

import AccountParty from "../models/AccountParty";

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
    const initialStage =
      req.body.stage || "LEAD";

    /*
     * Find the highest existing numeric customer code.
     *
     * We do NOT use countDocuments() because deleted
     * customers can create gaps in the sequence.
     *
     * Example:
     * CUST-047
     * CUST-048
     * CUST-050
     *
     * Next should be CUST-051, not CUST-050.
     */

    const existingCustomers =
      await Customer.find(
        {
          customerCode: {
            $regex: /^CUST-\d+$/,
          },
        },
        {
          customerCode: 1,
        }
      ).lean();

    let highestNumber = 0;

    for (const customer of existingCustomers) {
      const match =
        customer.customerCode.match(
          /^CUST-(\d+)$/
        );

      if (match) {
        const number = Number(match[1]);

        if (number > highestNumber) {
          highestNumber = number;
        }
      }
    }

    /*
     * Start with the next available number.
     */
    let nextNumber = highestNumber + 1;

    let customer;

    /*
     * Retry if another request happens to create
     * the same code at the exact same time.
     */
    for (let attempt = 0; attempt < 10; attempt++) {
      const customerCode =
        `CUST-${String(nextNumber).padStart(3, "0")}`;

      try {
        customer =
          await Customer.create({
            customerCode,

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

            assignedSalespeople:
              Array.isArray(
                req.body.assignedSalespeople
              )
                ? req.body.assignedSalespeople
                : [],

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
                note: "Lead created",
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

        /*
         * Successfully created.
         */
        break;
      } catch (error: any) {
        /*
         * Duplicate customerCode.
         *
         * Move to the next number and retry.
         */
        if (
          error?.code === 11000 &&
          error?.keyPattern?.customerCode
        ) {
          nextNumber++;
          continue;
        }

        throw error;
      }
    }

    /*
     * Safety check in case all retry attempts failed.
     */
    if (!customer) {
      return res.status(500).json({
        message:
          "Unable to generate a unique customer code. Please try again.",
      });
    }

    return res.status(201).json(
      customer
    );
  } catch (error: any) {
    console.error(
      "CREATE CUSTOMER ERROR:",
      error
    );

    return res.status(500).json({
      message:
        error?.message ||
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

export const updateCustomerPipeline = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { id } = req.params;

    const {
      stage,
      assignedSalesperson,
      assignedSalespeople,
      lastContactDate,
      nextFollowUpDate,
      nextAction,
      negotiationNotes,
      stageNote,
    } = req.body;

    const customer =
      await Customer.findById(id);

    if (!customer) {
      return res.status(404).json({
        message: "Customer not found",
      });
    }

    /*
     * STAGE
     */

    if (
      stage !== undefined &&
      stage !== customer.stage
    ) {
      customer.stage = stage;

      customer.stageHistory.push({
        stage,
        changedAt: new Date(),
        changedBy: req.user?.userId,
        note: stageNote?.trim() || "",
      });
    }

    /*
     * SALESPERSON ASSIGNMENT
     */

    if (
      assignedSalespeople !== undefined
    ) {
      customer.assignedSalespeople =
        Array.isArray(
          assignedSalespeople
        )
          ? assignedSalespeople
          : [];
    }

    /*
     * OLD FIELD — BACKWARD COMPATIBILITY
     */

    if (
      assignedSalesperson !== undefined
    ) {
      customer.assignedSalesperson =
        assignedSalesperson;
    }

    /*
     * CONTACT / FOLLOW-UP
     */

    if (
      lastContactDate !== undefined
    ) {
      customer.lastContactDate =
        lastContactDate
          ? new Date(lastContactDate)
          : undefined;
    }

    if (
      nextFollowUpDate !== undefined
    ) {
      customer.nextFollowUpDate =
        nextFollowUpDate
          ? new Date(nextFollowUpDate)
          : undefined;
    }

    /*
     * CRM ACTION DATA
     */

    if (
      nextAction !== undefined
    ) {
      customer.nextAction =
        nextAction.trim();
    }

    if (
      negotiationNotes !== undefined
    ) {
      customer.negotiationNotes =
        negotiationNotes.trim();
    }

    await customer.save();

    const updatedCustomer =
      await Customer.findById(id)
        .populate(
          "assignedSalespeople",
          "name employeeId role status"
        )
        .populate(
          "stageHistory.changedBy",
          "name employeeId"
        );

    return res.json(
      updatedCustomer
    );
  } catch (error) {
    console.error(
      "Update customer pipeline error:",
      error
    );

    return res.status(500).json({
      message:
        "Failed to update customer pipeline",
    });
  }
};


// ==============================
// GET SALES PIPELINE
// ==============================

// ==============================
// GET SALES PIPELINE
// ==============================
// ==============================
// GET SALES PIPELINE
// ==============================

export const getSalesPipeline = async (
  req: Request,
  res: Response
) => {
  try {
    // --------------------------------
    // CRM CUSTOMERS / LEADS
    // --------------------------------

    const customers =
  await Customer.find()
    .populate(
      "assignedSalespeople",
      "name employeeId role status"
    )
    .populate(
      "stageHistory.changedBy",
      "name employeeId"
    )
    .populate(
      "specialNotes.addedBy",
      "name employeeId role"
    )
    .sort({
      nextFollowUpDate: 1,
      createdAt: -1,
    });

    // --------------------------------
    // ACCOUNTS PARTIES
    // --------------------------------

    const parties =
      await AccountParty.find({
        status: "Active",
        partyType: {
          $in: [
            "CUSTOMER",
            "SUPPLIER",
          ],
        },
      })
        .populate(
          "assignedSalespeople",
          "name employeeId role status"
        )
        .sort({
          createdAt: -1,
        });

    // --------------------------------
    // NORMALIZE CRM CUSTOMERS
    // --------------------------------

    const customerRecords =
      customers.map(
        (customer: any) => ({
          ...customer.toObject(),

          source: "CRM",

          crmType:
            customer.stage === "LEAD"
              ? "LEAD"
              : "CUSTOMER",
        })
      );

    // --------------------------------
    // NORMALIZE ACCOUNTS PARTIES
    // --------------------------------

    const partyRecords =
      parties.map(
        (party: any) => ({
          ...party.toObject(),

          source: "ACCOUNTS",

          crmType: "PARTY",

          /*
           * AccountParty does not currently
           * own a CRM stage.
           *
           * Until party pipeline stages are
           * persisted, start them at Lead.
           */
          stage:
            party.crmStage ||
            "LEAD",

          crmPipeline:
            party.crmPipeline ||
            "Sales Pipeline",

          crmAssociation:
            party.crmAssociation ||
            "PARTY",

          assignedSalespeople:
            Array.isArray(
              party.assignedSalespeople
            )
              ? party.assignedSalespeople
              : [],

          customerCode:
            party.partyCode,

          gstNumber:
            party.customerDetails
              ?.gstNumber ||
            party.supplierDetails
              ?.gstNumber ||
            "",

          dueDate:
            party.customerDetails
              ?.dueDate ||
            party.supplierDetails
              ?.dueDate ||
            null,
        })
      );

    // --------------------------------
    // COMBINED PIPELINE
    // --------------------------------

    const pipeline = [
      ...customerRecords,
      ...partyRecords,
    ];

    return res.status(200).json(
      pipeline
    );
  } catch (error) {
    console.error(
      "Failed to fetch sales pipeline:",
      error
    );

    return res.status(500).json({
      message:
        "Failed to fetch sales pipeline",

      error:
        error instanceof Error
          ? error.message
          : "Unknown error",
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