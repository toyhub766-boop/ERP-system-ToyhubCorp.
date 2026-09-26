import mongoose, {
  Document,
  Schema,
} from "mongoose";

export interface IMaterialSelection {
  requiredMaterial: mongoose.Types.ObjectId;
  selectedMaterial: mongoose.Types.ObjectId;
  reason?: string;
}

export interface IProductionChecklist {
  preparing: string[];
  leaving: string[];
  reason?: string;
  updatedAt?: Date | null;
}

export interface IProductionItem {
  // Legacy Inventory Product reference.
  // Optional because CRM Production now comes from Catalogue.
  product?: mongoose.Types.ObjectId | null;

  // Catalogue source for CRM orders.
  catalogueProduct?: mongoose.Types.ObjectId | null;

  // BOM is optional because Trading Catalogue products
  // do not enter the manufacturing/BOM process.
  bom?: mongoose.Types.ObjectId | null;

  image?: string;
  marka?: string;
  category?: string;
  price?: number;
  importantNotes?: string;

  // Original CRM ordered quantity.
  // NEVER overwrite this with actual produced quantity.
  quantity: number;

  materialSelections: IMaterialSelection[];

  checklist: IProductionChecklist;

  // Actual quantity physically produced.
  actualQuantity?: number | null;

  /**
   * Inventory Product from which existing finished stock
   * is being used to fulfil this order.
   *
   * This is only relevant when existingStockQuantity > 0.
   *
   * It does NOT deduct inventory during Production.
   * Inventory is deducted when the corresponding quantity
   * is actually dispatched.
   */
  existingStockProduct?: mongoose.Types.ObjectId | null;

  /**
   * Finished-goods stock already available and allocated
   * toward this CRM order.
   */
  existingStockQuantity?: number;

  /**
   * Quantity explicitly handed over as ready for Dispatch.
   */
  readyForDispatchQuantity?: number;

  completed: boolean;

  readyForDispatch: boolean;

  remarks?: string;
}

export interface IProduction extends Document {
  orderNumber: string;

  // Customer remains the AccountParty for CRM-created production.
  client: mongoose.Types.ObjectId;

  clientModel:
    | "ProductionClient"
    | "AccountParty";

  // CRM Order which created this Production record.
  crmOrder?: mongoose.Types.ObjectId | null;

  items: IProductionItem[];

  team: string;

  status:
    | "Draft"
    | "Approved"
    | "Started"
    | "In Progress"
    | "Completed"
    | "Cancelled";

  // CRM-created production does not require a target date.
  targetDate?: Date | null;

  transport?: string;

  notes?: string;

  createdBy: mongoose.Types.ObjectId;

  completedAt?: Date | null;

  createdAt: Date;

  updatedAt: Date;
}

const MaterialSelectionSchema = new Schema(
  {
    requiredMaterial: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    selectedMaterial: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    reason: {
      type: String,
      default: "",
    },
  },
  {
    _id: false,
  }
);

const ProductionChecklistSchema = new Schema(
  {
    preparing: {
      type: [String],
      default: [],
    },

    leaving: {
      type: [String],
      default: [],
    },

    reason: {
      type: String,
      default: "",
    },

    updatedAt: {
      type: Date,
      default: null,
    },
  },
  {
    _id: false,
  }
);

const ProductionItemSchema = new Schema(
  {
    /**
     * Legacy Inventory Product reference.
     *
     * Kept for compatibility with existing Production
     * records and non-CRM production workflows.
     */
    product: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      default: null,
    },

    /**
     * Catalogue product from the CRM Order.
     */
    catalogueProduct: {
      type: Schema.Types.ObjectId,
      ref: "Catalogue",
      default: null,
    },

    /**
     * Manufacturing BOM.
     *
     * Trading products have no BOM.
     */
    bom: {
      type: Schema.Types.ObjectId,
      ref: "BOM",
      default: null,
    },

    image: {
      type: String,
      default: "",
    },

    marka: {
      type: String,
      default: "",
      trim: true,
    },

    category: {
      type: String,
      default: "",
      trim: true,
    },

    price: {
      type: Number,
      default: 0,
      min: 0,
    },

    importantNotes: {
      type: String,
      default: "",
      trim: true,
    },

    /**
     * Original CRM ordered quantity.
     *
     * This must never be replaced by actual production
     * or dispatch quantities.
     */
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },

    materialSelections: {
      type: [MaterialSelectionSchema],
      default: [],
    },

    checklist: {
      type: ProductionChecklistSchema,

      default: () => ({
        preparing: [],
        leaving: [],
        reason: "",
      }),
    },

    /**
     * Actual quantity physically manufactured.
     */
    actualQuantity: {
      type: Number,
      default: null,
      min: 0,
    },

    /**
     * Inventory Product used as existing finished stock.
     *
     * This allows Dispatch to identify exactly which
     * inventory record must be deducted.
     */
    existingStockProduct: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      default: null,
    },

    /**
     * Existing finished stock allocated toward this order.
     *
     * This does NOT deduct inventory during Production.
     */
    existingStockQuantity: {
      type: Number,
      default: 0,
      min: 0,
    },

    /**
     * Quantity explicitly made available to Dispatch.
     */
    readyForDispatchQuantity: {
      type: Number,
      default: 0,
      min: 0,
    },

    completed: {
      type: Boolean,
      default: false,
    },

    readyForDispatch: {
      type: Boolean,
      default: false,
    },

    remarks: {
      type: String,
      default: "",
    },
  },
  {
    _id: true,
  }
);

const ProductionSchema = new Schema(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
    },

    client: {
      type: Schema.Types.ObjectId,
      refPath: "clientModel",
      required: true,
    },

    clientModel: {
      type: String,
      enum: [
        "ProductionClient",
        "AccountParty",
      ],
      default: "ProductionClient",
      required: true,
    },

    /**
     * Link back to the commercial CRM Order.
     */
    crmOrder: {
      type: Schema.Types.ObjectId,
      ref: "Order",
      default: null,
    },

    items: {
      type: [ProductionItemSchema],

      required: true,

      validate: {
        validator: (
          value: IProductionItem[]
        ) =>
          Array.isArray(value) &&
          value.length > 0,

        message:
          "At least one production item is required",
      },
    },

    team: {
      type: String,
      default: "Unassigned",
    },

    status: {
      type: String,

      enum: [
        "Draft",
        "Approved",
        "Started",
        "In Progress",
        "Completed",
        "Cancelled",
      ],

      default: "Draft",
    },

    targetDate: {
      type: Date,
      default: null,
    },

    transport: {
      type: String,
      default: "",
    },

    notes: {
      type: String,
      default: "",
    },

    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    completedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IProduction>(
  "Production",
  ProductionSchema
);