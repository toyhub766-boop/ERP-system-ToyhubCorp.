import mongoose, {
  Document,
  Schema,
} from "mongoose";

// ============================================================
// ORDER ITEM
// ============================================================

export interface IOrderItem {
  catalogueProduct: mongoose.Types.ObjectId;

  // Snapshot of Catalogue data at order time
  name: string;
  modelNumber?: string;
  marka?: string;
  image?: string;

  productType:
    | "TRADING"
    | "MANUFACTURING";

  // Optional because manufacturing products
  // may exist without a BOM.
  bom?: mongoose.Types.ObjectId | null;

  // Snapshot of catalogue MOQ
  moq: number;

  quantity: number;

  unitPrice: number;

  totalPrice: number;
}

// ============================================================
// ORDER
// ============================================================

export interface IOrder extends Document {
  customer: mongoose.Types.ObjectId;

  /** Parent CRM order when this order was created as a refill. */
  refillOf?: mongoose.Types.ObjectId | null;

  /** Production execution record created from this CRM order. */
  production?: mongoose.Types.ObjectId | null;

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

  createdAt: Date;
  updatedAt: Date;
}

// ============================================================
// ORDER ITEM SCHEMA
// ============================================================

const OrderItemSchema = new Schema<IOrderItem>(
  {
    catalogueProduct: {
      type: Schema.Types.ObjectId,
      ref: "Catalogue",
      required: true,
    },

    // --------------------------------------------------------
    // CATALOGUE SNAPSHOT
    // --------------------------------------------------------

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
      enum: [
        "TRADING",
        "MANUFACTURING",
      ],
      required: true,
    },

    // --------------------------------------------------------
    // OPTIONAL BOM
    // --------------------------------------------------------

    bom: {
      type: Schema.Types.ObjectId,
      ref: "BOM",
      default: null,
    },

    // --------------------------------------------------------
    // ORDERING
    // --------------------------------------------------------

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

// ============================================================
// ORDER SCHEMA
// ============================================================

const OrderSchema = new Schema<IOrder>(
  {
    customer: {
      type: Schema.Types.ObjectId,
      ref: "AccountParty",
      required: true,
    },

    refillOf: {
      type: Schema.Types.ObjectId,
      ref: "Order",
      default: null,
      index: true,
    },

    production: {
      type: Schema.Types.ObjectId,
      ref: "Production",
      default: null,
      index: true,
    },

    orderNumber: {
      type: String,
      required: true,
      unique: true,
    },

    items: {
      type: [OrderItemSchema],
      required: true,
      validate: {
        validator: (
          value: IOrderItem[]
        ) =>
          Array.isArray(value) &&
          value.length > 0,
        message:
          "At least one order item is required.",
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
  },
  {
    timestamps: true,
  }
);

// ============================================================
// MODEL
// ============================================================

export default mongoose.model<IOrder>(
  "Order",
  OrderSchema
);