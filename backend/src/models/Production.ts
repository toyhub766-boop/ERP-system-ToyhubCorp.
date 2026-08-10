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
  updatedAt?: Date;
}

export interface IProductionItem {
  product: mongoose.Types.ObjectId;
  bom: mongoose.Types.ObjectId;
  quantity: number;

  materialSelections: IMaterialSelection[];

  checklist: IProductionChecklist;

  actualQuantity?: number;
  completed: boolean;
  readyForDispatch: boolean;
  remarks?: string;
}

export interface IProduction extends Document {
  orderNumber: string;

  client: mongoose.Types.ObjectId;

  items: IProductionItem[];

  team: string;

  status:
    | "Draft"
    | "Approved"
    | "Started"
    | "In Progress"
    | "Completed"
    | "Cancelled";

  targetDate: Date;

  transport?: string;

  notes?: string;

  createdBy: mongoose.Types.ObjectId;

  completedAt?: Date;

  createdAt: Date;
  updatedAt: Date;
}

const MaterialSelectionSchema =
  new Schema(
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

const ProductionChecklistSchema =
  new Schema(
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

const ProductionItemSchema =
  new Schema(
    {
      product: {
        type: Schema.Types.ObjectId,
        ref: "Product",
        required: true,
      },

      bom: {
        type: Schema.Types.ObjectId,
        ref: "BOM",
        required: true,
      },

      quantity: {
        type: Number,
        required: true,
        min: 1,
      },

      materialSelections: {
        type: [
          MaterialSelectionSchema,
        ],
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

      actualQuantity: {
        type: Number,
        default: null,
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

const ProductionSchema =
  new Schema(
    {
      orderNumber: {
        type: String,
        required: true,
        unique: true,
      },

      client: {
        type: Schema.Types.ObjectId,
        ref: "ProductionClient",
        required: true,
      },

      items: {
        type: [
          ProductionItemSchema,
        ],
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
        required: true,
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