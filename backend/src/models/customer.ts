import mongoose, { Schema, Document } from "mongoose";

export interface ICustomer extends Document {
  customerCode: string;
  companyName: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  gstNumber: string;
  status: "Active" | "Inactive";
}

const customerSchema = new Schema<ICustomer>(
  {
    customerCode: {
      type: String,
      required: true,
      unique: true,
    },

    companyName: {
      type: String,
      required: true,
    },

    contactPerson: {
      type: String,
      required: true,
    },

    phone: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      default: "",
    },

    address: {
      type: String,
      default: "",
    },

    city: {
      type: String,
      default: "",
    },

    state: {
      type: String,
      default: "",
    },

    pincode: {
      type: String,
      default: "",
    },

    gstNumber: {
      type: String,
      default: "",
    },

    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<ICustomer>(
  "Customer",
  customerSchema
);