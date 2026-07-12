import { Request, Response } from "express";
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
  
  ...req.body,
  customerCode: `CUST-${String(count + 1).padStart(3, "0")}`,
});

console.log("Create customer endpoint hit");
console.log(req.body);
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
    const customer = await Customer.findByIdAndUpdate(
      req.params.id,
      req.body,
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