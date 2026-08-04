import { Request, Response } from "express";
import AccountParty from "../models/AccountParty";

// ==============================
// GET ALL PARTIES
// ==============================

export const getParties = async (
  req: Request,
  res: Response
) => {
  try {
    const parties = await AccountParty.find().sort({
      createdAt: -1,
    });

    return res.json(parties);

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      message: "Failed to fetch parties",
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

    const party = await AccountParty.findById(
      req.params.id
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

    const count =
      await AccountParty.countDocuments();

    const openingBalance = Number(
      req.body.openingBalance || 0
    );

    const party =
      await AccountParty.create({

        partyCode: `PARTY-${String(
          count + 1
        ).padStart(3, "0")}`,

        partyType:
          req.body.partyType || "CUSTOMER",

        companyName:
          req.body.companyName,

        contactPerson:
          req.body.contactPerson || "",

        phone:
          req.body.phone || "",

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

    return res.status(201).json(
      party
    );

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      message: "Failed to create party",
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

      companyName:
        req.body.companyName,

      contactPerson:
        req.body.contactPerson,

      phone:
        req.body.phone,

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

      currentBalance: Number(
        req.body.currentBalance || 0
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

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      message: "Failed to update party",
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