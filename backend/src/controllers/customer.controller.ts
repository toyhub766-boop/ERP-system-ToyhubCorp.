import { Request, Response } from "express";
import { AuthRequest } from "../middlewares/auth.middleware";
import Customer from "../models/customer";

// GET ALL
export const getCustomers = async (
  req: Request,
  res: Response
) => {
  try {
    const customers = await Customer.find().sort({
      createdAt: -1,
    });

    res.json(customers);

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch customers",
    });
  }
};

// GET ONE
export const getCustomerById = async (
  req: Request,
  res: Response
) => {
  try {
    const customer = await Customer.findById(
      req.params.id
    );

    if (!customer) {
      return res.status(404).json({
        message: "Customer not found",
      });
    }

    res.json(customer);

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch customer",
    });
  }
};

// CREATE
export const createCustomer = async (
  req: Request,
  res: Response
) => {
  try {
    const count = await Customer.countDocuments();

    const customer = await Customer.create({
      customerCode: `CUST-${String(count + 1).padStart(3, "0")}`,

      companyName: req.body.companyName,
      contactPerson: req.body.contactPerson,
      phone: req.body.phone,
      email: req.body.email,
      address: req.body.address,
      city: req.body.city,
      state: req.body.state,
      pincode: req.body.pincode,
      gstNumber: req.body.gstNumber,

      billingName: req.body.billingName || "",
      station: req.body.station || "",

      packingCharges: Number(req.body.packingCharges || 0),
      transportCharges: Number(req.body.transportCharges || 0),
      paymentTerms: Number(req.body.paymentTerms || 0),

      stage: req.body.stage || "LEAD",
      category: req.body.category || "OTHER",

      reminderDate: req.body.reminderDate || null,
      reminderSet: req.body.reminderSet || false,

      specialNotes: req.body.specialNotes || [],

      partyType: req.body.partyType || "CUSTOMER",

      openingBalance: Number(req.body.openingBalance || 0),
      currentBalance: Number(req.body.currentBalance || 0),

      status: req.body.status || "Active",
    });

    res.status(201).json(customer);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to create customer",
    });
  }
};

// UPDATE
export const updateCustomer = async (
  req: Request,
  res: Response
) => {
  try {
    const updateData = {
  ...req.body,

  packingCharges: Number(req.body.packingCharges || 0),
  transportCharges: Number(req.body.transportCharges || 0),
  paymentTerms: Number(req.body.paymentTerms || 0),

  openingBalance: Number(req.body.openingBalance || 0),
  currentBalance: Number(req.body.currentBalance || 0),
};

const customer = await Customer.findByIdAndUpdate(
  req.params.id,
  updateData,
  {
    new: true,
    runValidators: true,
  }
);

    if (!customer) {
      return res.status(404).json({
        message: "Customer not found",
      });
    }

    res.json(customer);
  } catch (error) {
    res.status(500).json({
      message: "Failed to update customer",
    });
  }
};

// DELETE
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
        message: "Customer not found",
      });
    }

    res.json({
      message: "Customer deleted",
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to delete customer",
    });
  }
};


export const addCustomerNote = async (
  req: AuthRequest,
  res: Response
)=> {
  try {
    const customer = await Customer.findById(
      req.params.id
    );

    if (!customer) {
      return res.status(404).json({
        message: "Customer not found",
      });
    }

    customer.specialNotes.unshift({
      title: req.body.title,
      note: req.body.note,
      type: req.body.type,
      priority: req.body.priority,
      reminderDate: req.body.reminderDate,
addedBy: req.user?.userId,    } as any);

    await customer.save();

    res.status(201).json(customer);

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to add note",
    });
  }
};

export const updateCustomerNote = async (
  req: Request,
  res: Response
) => {
  try {

    const customer = await Customer.findById(
      req.params.id
    );

    if (!customer) {
      return res.status(404).json({
        message: "Customer not found",
      });
    }

    const note = customer.specialNotes.find(
  (note: any) =>
    note._id.toString() === req.params.noteId
);

    if (!note) {
      return res.status(404).json({
        message: "Note not found",
      });
    }

    Object.assign(note, req.body);

    await customer.save();

    res.json(customer);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: "Failed to update note",
    });

  }
};

export const deleteCustomerNote = async (
  req: Request,
  res: Response
) => {

  try {

    const customer = await Customer.findById(
      req.params.id
    );

    if (!customer) {
      return res.status(404).json({
        message: "Customer not found",
      });
    }

    customer.specialNotes =
      customer.specialNotes.filter(
        (note: any) =>
          note._id.toString() !==
          req.params.noteId
      ) as any;

    await customer.save();

    res.json({
      message: "Note deleted",
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: "Failed to delete note",
    });

  }

};