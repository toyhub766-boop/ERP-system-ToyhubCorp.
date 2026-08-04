import mongoose, { Document, Schema } from "mongoose";

export interface IAccountParty extends Document {
  partyCode: string;

  partyType:
    | "CUSTOMER"
    | "SUPPLIER"
    | "COMPANY_EXPENSE";

  companyName: string;
  contactPerson: string;

  phone: string;
  email: string;

  address: string;
  city: string;
  state: string;
  pincode: string;

  openingBalance: number;
  currentBalance: number;

  remarks: string;

  status: "Active" | "Inactive";

  customerDetails?: {
    gstNumber: string;
    billingName: string;

    transportName: string;
    transportNumber: string;
    marka: string;
    station: string;

    packingCharges: number;
    transportCharges: number;

    paymentTerms: number;
    dueDate?: Date;
  };

  supplierDetails?: {
    gstNumber: string;

    paymentTerms: number;
    dueDate?: Date;
  };

  companyExpenseDetails?: {
    expenseCategory: string;
    description: string;
  };
}

const accountPartySchema = new Schema<IAccountParty>(
  {
    partyCode: {
      type: String,
      required: true,
      unique: true,
    },

    partyType: {
      type: String,
      enum: [
        "CUSTOMER",
        "SUPPLIER",
        "COMPANY_EXPENSE",
      ],
      required: true,
    },

    companyName: {
      type: String,
      required: true,
    },

    contactPerson: {
      type: String,
      default: "",
    },

    phone: {
      type: String,
      default: "",
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

    openingBalance: {
      type: Number,
      default: 0,
    },

    currentBalance: {
      type: Number,
      default: 0,
    },

    remarks: {
      type: String,
      default: "",
    },

    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },

    customerDetails: {
      gstNumber: {
        type: String,
        default: "",
      },

      billingName: {
        type: String,
        default: "",
      },

      transportName: {
        type: String,
        default: "",
      },

      transportNumber: {
        type: String,
        default: "",
      },

      marka: {
        type: String,
        default: "",
      },

      station: {
        type: String,
        default: "",
      },

      packingCharges: {
        type: Number,
        default: 0,
      },

      transportCharges: {
        type: Number,
        default: 0,
      },

      paymentTerms: {
        type: Number,
        default: 0,
      },

      dueDate: {
        type: Date,
      },
    },

    supplierDetails: {
      gstNumber: {
        type: String,
        default: "",
      },

      paymentTerms: {
        type: Number,
        default: 0,
      },

      dueDate: {
        type: Date,
      },
    },

    companyExpenseDetails: {
      expenseCategory: {
        type: String,
        default: "",
      },

      description: {
        type: String,
        default: "",
      },
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IAccountParty>(
  "AccountParty",
  accountPartySchema
);