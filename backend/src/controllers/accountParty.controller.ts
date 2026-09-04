import { Request, Response } from "express";
import AccountParty from "../models/AccountParty";

import {
  AuthRequest,
} from "../middlewares/auth.middleware";

// ==============================
// GET ALL PARTIES
// ==============================

export const getParties = async (
  req: Request,
  res: Response
) => {
  try {
    const parties =
  await AccountParty.find()
    .populate(
      "assignedSalespeople",
      "name role status"
    )
    .populate(
      "specialNotes.addedBy",
      "name employeeId role"
    )
    .sort({
      createdAt: -1,
    });

    return res.json(parties);
  } catch (error) {
    console.error(
      "GET PARTIES ERROR:",
      error
    );

    return res.status(500).json({
      message:
        "Failed to fetch parties",
    });
  }
};

// ==============================
// GET SINGLE PARTY
// ==============================

export const getPartyById = async (
  req: Request,
  res: Response
) => {
  try {
    const party =
  await AccountParty.findById(
    req.params.id
  )
    .populate(
      "assignedSalespeople",
      "name employeeId role status"
    )
    .populate(
      "specialNotes.addedBy",
      "name employeeId role"
    );

    if (!party) {
      return res.status(404).json({
        message: "Party not found",
      });
    }

    return res.json(party);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Failed to fetch party",
    });
  }
};

// ==============================
// CREATE PARTY
// ==============================

export const createParty = async (
  req: Request,
  res: Response
) => {
  try {
    const lastParty =
  await AccountParty.findOne()
    .sort({ createdAt: -1 })
    .select("partyCode");

let nextNumber = 1;

if (lastParty?.partyCode) {
  const match =
    lastParty.partyCode.match(
      /PARTY-(\d+)/
    );

  if (match) {
    nextNumber =
      Number(match[1]) + 1;
  }
}

const partyCode =
  `PARTY-${String(
    nextNumber
  ).padStart(3, "0")}`;

    const openingBalance = Number(
      req.body.openingBalance || 0
    );

    const party = await AccountParty.create({
      partyCode,

      partyType:
        req.body.partyType || "CUSTOMER",

      firmName:
        req.body.firmName || "",

      companyName:
        req.body.companyName,

      contactPerson:
        req.body.contactPerson || "",

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

      openingBalance,

      currentBalance:
        openingBalance,

      remarks:
        req.body.remarks || "",

      status:
        req.body.status || "Active",

      customerDetails: {
        gstNumber:
          req.body.gstNumber || "",

        billingName:
          req.body.billingName || "",

        transportName:
          req.body.transportName || "",

        transportNumber:
          req.body.transportNumber || "",

        transportPhone:
          req.body.transportPhone || "",

        marka:
          req.body.marka || "",

        station:
          req.body.station || "",

        packingCharges: Number(
          req.body.packingCharges || 0
        ),

        transportCharges: Number(
          req.body.transportCharges || 0
        ),

        paymentTerms: Number(
          req.body.paymentTerms || 0
        ),

        dueDate:
          req.body.dueDate || null,
      },

      supplierDetails: {
        gstNumber:
          req.body.gstNumber || "",

        paymentTerms: Number(
          req.body.paymentTerms || 0
        ),

        dueDate:
          req.body.dueDate || null,
      },

      companyExpenseDetails: {
        expenseCategory:
          req.body.expenseCategory || "",

        description:
          req.body.description || "",
      },
    });

    return res.status(201).json(party);
  } catch (error: any) {
    console.error("CREATE PARTY ERROR:");
    console.error(error);

    return res.status(400).json({
      message:
        error?.message ||
        "Failed to create party",
    });
  }
};

// ==============================
// UPDATE PARTY
// ==============================

export const updateParty = async (
  req: Request,
  res: Response
) => {
  try {
    const updateData = {
  partyType:
    req.body.partyType,

  firmName:
    req.body.firmName || "",

  companyName:
    req.body.companyName,

      contactPerson:
        req.body.contactPerson,

      email:
        req.body.email,

      address:
        req.body.address,

      city:
        req.body.city,

      state:
        req.body.state,

      pincode:
        req.body.pincode,

      openingBalance: Number(
        req.body.openingBalance || 0
      ),

      remarks:
        req.body.remarks || "",

      status:
        req.body.status || "Active",

      customerDetails: {
        gstNumber:
          req.body.gstNumber || "",

        billingName:
          req.body.billingName || "",

        transportName:
          req.body.transportName || "",

        transportNumber:
          req.body.transportNumber || "",

        transportPhone:
          req.body.transportPhone || "",

        marka:
          req.body.marka || "",

        station:
          req.body.station || "",

        packingCharges: Number(
          req.body.packingCharges || 0
        ),

        transportCharges: Number(
          req.body.transportCharges || 0
        ),

        paymentTerms: Number(
          req.body.paymentTerms || 0
        ),

        dueDate:
          req.body.dueDate || null,
      },

      supplierDetails: {
        gstNumber:
          req.body.gstNumber || "",

        paymentTerms: Number(
          req.body.paymentTerms || 0
        ),

        dueDate:
          req.body.dueDate || null,
      },

      companyExpenseDetails: {
        expenseCategory:
          req.body.expenseCategory || "",

        description:
          req.body.description || "",
      },
    };

    const party =
      await AccountParty.findByIdAndUpdate(
        req.params.id,
        updateData,
        {
          new: true,
          runValidators: true,
        }
      );

    if (!party) {
      return res.status(404).json({
        message: "Party not found",
      });
    }

    return res.json(party);
  } catch (error: any) {
    console.error("UPDATE PARTY ERROR:");
    console.error(error);

    return res.status(400).json({
      message:
        error?.message ||
        "Failed to update party",
    });
  }
};

// ==============================
// UPDATE DUE DATE ONLY
// ==============================

export const updatePartyDueDate = async (
  req: Request,
  res: Response
) => {
  try {
    const { dueDate } = req.body;

    const party =
      await AccountParty.findById(
        req.params.id
      );

    if (!party) {
      return res.status(404).json({
        message: "Party not found",
      });
    }

    if (party.partyType === "CUSTOMER") {
      party.customerDetails = {
        ...(party.customerDetails || {
          gstNumber: "",
          billingName: "",
          transportName: "",
          transportNumber: "",
          transportPhone: "",
          marka: "",
          station: "",
          packingCharges: 0,
          transportCharges: 0,
          paymentTerms: 0,
        }),

        dueDate: dueDate
          ? new Date(dueDate)
          : undefined,
      };
    }

    if (party.partyType === "SUPPLIER") {
      party.supplierDetails = {
        ...(party.supplierDetails || {
          gstNumber: "",
          paymentTerms: 0,
        }),

        dueDate: dueDate
          ? new Date(dueDate)
          : undefined,
      };
    }

    await party.save();

    return res.json(party);
  } catch (error: any) {
    console.error(
      "UPDATE PARTY DUE DATE ERROR:"
    );
    console.error(error);

    return res.status(400).json({
      message:
        error?.message ||
        "Failed to update due date",
    });
  }
};

// ==============================
// UPDATE PARTY SALESPERSONS
// ==============================

export const updatePartySalespeople = async (
  req: Request,
  res: Response
) => {
  try {
    const {
      assignedSalespeople,
    } = req.body;

    if (
      !Array.isArray(
        assignedSalespeople
      )
    ) {
      return res.status(400).json({
        message:
          "assignedSalespeople must be an array",
      });
    }

    const party =
      await AccountParty.findById(
        req.params.id
      );

    if (!party) {
      return res.status(404).json({
        message: "Party not found",
      });
    }

    party.assignedSalespeople =
      assignedSalespeople;

    await party.save();

    const updatedParty =
      await AccountParty.findById(
        req.params.id
      ).populate(
        "assignedSalespeople",
        "name role status"
      );

    return res.json(
      updatedParty
    );
  } catch (error) {
    console.error(
      "UPDATE PARTY SALESPERSONS ERROR:",
      error
    );

    return res.status(500).json({
      message:
        "Failed to update party salesperson assignment",
    });
  }
};

// ==============================
// DELETE PARTY
// ==============================

export const deleteParty = async (
  req: Request,
  res: Response
) => {
  try {
    const party =
      await AccountParty.findByIdAndDelete(
        req.params.id
      );

    if (!party) {
      return res.status(404).json({
        message: "Party not found",
      });
    }

    return res.json({
      message:
        "Party deleted successfully",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Failed to delete party",
    });
  }
};

// ==============================
// UPDATE PARTY CRM PIPELINE
// ==============================

export const updatePartyPipeline = async (
  req: Request,
  res: Response
) => {
  try {
    const {
      crmPipeline,
      crmStage,
      crmAssociation,
    } = req.body;

    const party =
      await AccountParty.findById(
        req.params.id
      );

    if (!party) {
      return res.status(404).json({
        message:
          "Party not found",
      });
    }

    if (
      crmPipeline !== undefined
    ) {
      party.crmPipeline =
        crmPipeline;
    }

    if (
      crmStage !== undefined
    ) {
      party.crmStage =
        crmStage;
    }

    if (
      crmAssociation !== undefined
    ) {
      party.crmAssociation =
        crmAssociation;
    }

    await party.save();

    const updatedParty =
      await AccountParty.findById(
        req.params.id
      ).populate(
        "assignedSalespeople",
        "name employeeId role status"
      );

    return res.json(
      updatedParty
    );
  } catch (error) {
    console.error(
      "UPDATE PARTY CRM PIPELINE ERROR:",
      error
    );

    return res.status(500).json({
      message:
        "Failed to update party pipeline",
    });
  }
};


// ==============================
// ADD PARTY NOTE / CONVERSATION
// ==============================

export const addPartyNote = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const party =
      await AccountParty.findById(
        req.params.id
      );

    if (!party) {
      return res.status(404).json({
        message: "Party not found",
      });
    }

    const note =
      String(req.body.note || "").trim();

    if (!note) {
      return res.status(400).json({
        message:
          "Conversation note is required",
      });
    }

    party.specialNotes.unshift({
      title:
        String(
          req.body.title || ""
        ).trim(),

      note,

      type:
        req.body.type ||
        "GENERAL",

      priority:
        req.body.priority ||
        "MEDIUM",

      reminderDate:
        req.body.reminderDate
          ? new Date(
              req.body.reminderDate
            )
          : undefined,

      completed: false,

      addedBy:
        req.user?.userId,

      createdAt:
        new Date(),
    } as any);

    await party.save();

    const updatedParty =
      await AccountParty.findById(
        req.params.id
      )
        .populate(
          "assignedSalespeople",
          "name employeeId role status"
        )
        .populate(
          "specialNotes.addedBy",
          "name employeeId role"
        );

    return res.status(201).json(
      updatedParty
    );
  } catch (error) {
    console.error(
      "ADD PARTY NOTE ERROR:",
      error
    );

    return res.status(500).json({
      message:
        "Failed to add conversation",
    });
  }
};


// ==============================
// UPDATE PARTY NOTE
// ==============================

export const updatePartyNote = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const party =
      await AccountParty.findById(
        req.params.id
      );

    if (!party) {
      return res.status(404).json({
        message: "Party not found",
      });
    }

    const note =
      party.specialNotes.find(
        (item: any) =>
          item._id?.toString() ===
          req.params.noteId
      );

    if (!note) {
      return res.status(404).json({
        message: "Conversation not found",
      });
    }

    if (
      req.body.note !== undefined
    ) {
      const value =
        String(
          req.body.note
        ).trim();

      if (!value) {
        return res.status(400).json({
          message:
            "Conversation note cannot be empty",
        });
      }

      note.note = value;
    }

    if (
      req.body.title !== undefined
    ) {
      note.title =
        String(
          req.body.title || ""
        ).trim();
    }

    if (
      req.body.type !== undefined
    ) {
      note.type =
        req.body.type;
    }

    if (
      req.body.priority !== undefined
    ) {
      note.priority =
        req.body.priority;
    }

    if (
      req.body.reminderDate !==
      undefined
    ) {
      note.reminderDate =
        req.body.reminderDate
          ? new Date(
              req.body.reminderDate
            )
          : undefined;
    }

    if (
      req.body.completed !==
      undefined
    ) {
      note.completed =
        Boolean(
          req.body.completed
        );
    }

    await party.save();

    const updatedParty =
      await AccountParty.findById(
        req.params.id
      )
        .populate(
          "assignedSalespeople",
          "name employeeId role status"
        )
        .populate(
          "specialNotes.addedBy",
          "name employeeId role"
        );

    return res.json(
      updatedParty
    );
  } catch (error) {
    console.error(
      "UPDATE PARTY NOTE ERROR:",
      error
    );

    return res.status(500).json({
      message:
        "Failed to update conversation",
    });
  }
};


// ==============================
// DELETE PARTY NOTE
// ==============================

export const deletePartyNote = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const party =
      await AccountParty.findById(
        req.params.id
      );

    if (!party) {
      return res.status(404).json({
        message: "Party not found",
      });
    }

    const originalLength =
      party.specialNotes.length;

    party.specialNotes =
      party.specialNotes.filter(
        (note: any) =>
          note._id?.toString() !==
          req.params.noteId
      ) as any;

    if (
      party.specialNotes.length ===
      originalLength
    ) {
      return res.status(404).json({
        message:
          "Conversation not found",
      });
    }

    await party.save();

    return res.json({
      message:
        "Conversation deleted",
    });
  } catch (error) {
    console.error(
      "DELETE PARTY NOTE ERROR:",
      error
    );

    return res.status(500).json({
      message:
        "Failed to delete conversation",
    });
  }
};