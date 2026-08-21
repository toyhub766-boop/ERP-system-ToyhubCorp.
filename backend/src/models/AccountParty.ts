import mongoose, { Document, Schema } from "mongoose";

export interface IAccountParty extends Document {
  partyCode: string;

  partyType: "CUSTOMER" | "SUPPLIER" | "COMPANY_EXPENSE";

  firmName?: string;

  companyName: string;
  contactPerson: string;

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
    transportPhone: string;

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
      trim: true,
    },

    partyType: {
      type: String,
      enum: ["CUSTOMER", "SUPPLIER", "COMPANY_EXPENSE"],
      required: true,
    },

    firmName: {
  type: String,
  enum: [
    "Mehak Enterprises",
    "ToyHub Corp",
    "Firm 3",
  ],
  default: "",
  trim: true,
},

    companyName: {
      type: String,
      required: true,
      trim: true,
    },

    contactPerson: {
      type: String,
      default: "",
      trim: true,
    },

    email: {
      type: String,
      default: "",
      trim: true,
      lowercase: true,
    },

    address: {
      type: String,
      default: "",
      trim: true,
    },

    city: {
      type: String,
      default: "",
      trim: true,
    },

    state: {
      type: String,
      default: "",
      trim: true,
    },

    pincode: {
      type: String,
      default: "",
      trim: true,
    },

    // Opening balance cannot be negative.
    openingBalance: {
      type: Number,
      required: true,
      default: 0,
      min: [0, "Opening balance cannot be negative"],
      validate: {
        validator: Number.isFinite,
        message: "Opening balance must be a valid number",
      },
    },

    // Current balance CAN be negative.
    currentBalance: {
      type: Number,
      required: true,
      default: 0,
      validate: {
        validator: Number.isFinite,
        message: "Current balance must be a valid number",
      },
    },

    remarks: {
      type: String,
      default: "",
      trim: true,
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
        trim: true,
        uppercase: true,
      },

      billingName: {
        type: String,
        default: "",
        trim: true,
      },

      transportName: {
        type: String,
        default: "",
        trim: true,
      },

      transportNumber: {
        type: String,
        default: "",
        trim: true,
      },

      transportPhone: {
        type: String,
        default: "",
        trim: true,
      },

      marka: {
        type: String,
        default: "",
        trim: true,
      },

      station: {
        type: String,
        default: "",
        trim: true,
      },

      packingCharges: {
        type: Number,
        required: true,
        default: 0,
        min: [0, "Packing charges cannot be negative"],
        validate: {
          validator: Number.isFinite,
          message: "Packing charges must be a valid number",
        },
      },

      transportCharges: {
        type: Number,
        required: true,
        default: 0,
        min: [0, "Transport charges cannot be negative"],
        validate: {
          validator: Number.isFinite,
          message: "Transport charges must be a valid number",
        },
      },

      paymentTerms: {
        type: Number,
        required: true,
        default: 0,
        min: [0, "Payment terms cannot be negative"],
        max: [100, "Payment terms cannot exceed 100 days"],
        validate: {
          validator: Number.isInteger,
          message: "Payment terms must be a whole number of days",
        },
      },

      dueDate: {
        type: Date,
      },
    },

    supplierDetails: {
      gstNumber: {
        type: String,
        default: "",
        trim: true,
        uppercase: true,
      },

      paymentTerms: {
        type: Number,
        required: true,
        default: 0,
        min: [0, "Payment terms cannot be negative"],
        max: [100, "Payment terms cannot exceed 100 days"],
        validate: {
          validator: Number.isInteger,
          message: "Payment terms must be a whole number of days",
        },
      },

      dueDate: {
        type: Date,
      },
    },

    companyExpenseDetails: {
      expenseCategory: {
        type: String,
        default: "",
        trim: true,
      },

      description: {
        type: String,
        default: "",
        trim: true,
      },
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model<IAccountParty>(
  "AccountParty",
  accountPartySchema,
);
