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

  billingName: string;
  station: string;
  packingCharges: number;
  transportCharges: number;
  paymentTerms: number;

  stage:
    | "LEAD"
    | "RINGING"
    | "NEGOTIATION"
    | "CATALOG_SHARED"
    | "VERIFICATION"
    | "ACTIVE_DEALER"
    | "SUPPLIER"
    | "DELAYED_PAYMENT"
    | "CLOSED"
    | "NO_DEALER";

  category:
    | "ONLINE_SELLER"
    | "CONTAINER_PARTY"
    | "LOOSE_PARTY"
    | "CAKE_DOLL"
    | "TOY_DEALER"
    | "OTHER";

  specialNotes: {
    note: string;
    addedBy?: mongoose.Types.ObjectId;
    createdAt: Date;
  }[];

  reminderDate?: Date;
  reminderSet: boolean;

  status: "Active" | "Inactive";
  partyType: "CUSTOMER" | "SUPPLIER";
  openingBalance: number;
  currentBalance: number;
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

    billingName: {
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

    stage: {
      type: String,
      enum: [
        "LEAD",
        "RINGING",
        "NEGOTIATION",
        "CATALOG_SHARED",
        "VERIFICATION",
        "ACTIVE_DEALER",
        "SUPPLIER",
        "DELAYED_PAYMENT",
        "CLOSED",
        "NO_DEALER",
      ],
      default: "LEAD",
    },

    category: {
  type: String,
  enum: [
    "ONLINE_SELLER",
    "CONTAINER_PARTY",
    "LOOSE_PARTY",
    "CAKE_DOLL",
    "TOY_DEALER",
    "OTHER",
  ],
  default: "OTHER",
},

specialNotes: [
  {
    title: {
      type: String,
      default: "",
    },

    note: {
      type: String,
      required: true,
    },

    type: {
      type: String,
      enum: [
        "GENERAL",
        "PAYMENT",
        "MEETING",
        "FOLLOW_UP",
        "COMPLAINT",
        "PRODUCT",
      ],
      default: "GENERAL",
    },

    priority: {
      type: String,
      enum: [
        "LOW",
        "MEDIUM",
        "HIGH",
      ],
      default: "MEDIUM",
    },

    reminderDate: {
      type: Date,
    },

    completed: {
      type: Boolean,
      default: false,
    },

    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
],

reminderDate: {
  type: Date,
},

reminderSet: {
  type: Boolean,
  default: false,
},

    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },


    //NEW
    partyType: {
      type: String,
      enum: ["CUSTOMER", "SUPPLIER"],
      default: "CUSTOMER",
    },

    openingBalance: {
      type: Number,
      default: 0,
    },

    currentBalance: {
      type: Number,
      default: 0,
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