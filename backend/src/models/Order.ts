import mongoose, { Document, Schema } from "mongoose";

export interface IOrderItem {
  catalogueProduct: mongoose.Types.ObjectId;
  name: string;
  modelNumber?: string;
  marka?: string;
  image?: string;
  productType: "TRADING" | "MANUFACTURING";
  bom?: mongoose.Types.ObjectId | null;
  moq: number;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface IOrder extends Document {
  customer: mongoose.Types.ObjectId;
  orderNumber: string;
  items: IOrderItem[];
  totalAmount: number;
  status:
    | "Pending"
    | "Confirmed"
    | "In Production"
    | "Partially Produced"
    | "Ready for Dispatch"
    | "Partially Dispatched"
    | "Dispatched"
    | "Delivered"
    | "Cancelled";
  notes?: string;

  // Linked Production execution record.
  production?: mongoose.Types.ObjectId | null;

  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema = new Schema<IOrderItem>(
  {
    catalogueProduct: {
      type: Schema.Types.ObjectId,
      ref: "Catalogue",
      required: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    modelNumber: {
      type: String,
      default: "",
      trim: true,
    },

    marka: {
      type: String,
      default: "",
      trim: true,
    },

    image: {
      type: String,
      default: "",
    },

    productType: {
      type: String,
      enum: ["TRADING", "MANUFACTURING"],
      required: true,
    },

    bom: {
      type: Schema.Types.ObjectId,
      ref: "BOM",
      default: null,
    },

    moq: {
      type: Number,
      required: true,
      min: 1,
    },

    quantity: {
      type: Number,
      required: true,
      min: 1,
    },

    unitPrice: {
      type: Number,
      required: true,
      min: 0,
    },

    totalPrice: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    _id: true,
  }
);

const OrderSchema = new Schema<IOrder>(
  {
    customer: {
      type: Schema.Types.ObjectId,
      ref: "AccountParty",
      required: true,
    },

    orderNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    items: {
      type: [OrderItemSchema],
      required: true,
      validate: {
        validator: (value: IOrderItem[]) =>
          Array.isArray(value) && value.length > 0,
        message: "At least one order item is required.",
      },
    },

    totalAmount: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },

    status: {
      type: String,
      enum: [
        "Pending",
        "Confirmed",
        "In Production",
        "Partially Produced",
        "Ready for Dispatch",
        "Partially Dispatched",
        "Dispatched",
        "Delivered",
        "Cancelled",
      ],
      default: "Pending",
    },

    notes: {
      type: String,
      default: "",
      trim: true,
    },

    production: {
      type: Schema.Types.ObjectId,
      ref: "Production",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const Order = mongoose.model<IOrder>("Order", OrderSchema);

export default Order;
