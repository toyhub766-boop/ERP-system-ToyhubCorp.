import mongoose, { Document, Schema } from "mongoose";

export interface IDispatch extends Document {
  production: mongoose.Types.ObjectId;
  productionItem: mongoose.Types.ObjectId;

  quantity: number;

  destination: string;
  vehicleNumber?: string;

  dispatchedBy: mongoose.Types.ObjectId;

  dispatchedAt?: Date | null;

  status: "Pending" | "Dispatched" | "Delivered";

  cartonPhotos?: string[];
  challanPhoto?: string;

  notes?: string;

  deliveredAt?: Date | null;

  createdAt: Date;
  updatedAt: Date;
}

const DispatchSchema = new Schema<IDispatch>(
  {
    /**
     * Source Production record.
     *
     * A single Production order can have multiple Dispatch
     * records because partial dispatches are supported.
     */
    production: {
      type: Schema.Types.ObjectId,
      ref: "Production",
      required: true,
      index: true,
    },

    /**
     * Specific Production item being dispatched.
     *
     * This is intentionally NOT a ref because Production items
     * are embedded subdocuments rather than separate MongoDB
     * documents.
     *
     * This allows:
     * Production Order
     *   ├── Item A → Dispatch 1
     *   ├── Item A → Dispatch 2
     *   └── Item B → Dispatch 3
     */
    productionItem: {
      type: Schema.Types.ObjectId,
      required: true,
      index: true,
    },

    /**
     * Quantity dispatched in THIS dispatch transaction.
     *
     * This must never represent the original CRM order quantity.
     * Multiple Dispatch documents can therefore be created
     * against the same production item.
     */
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },

    /**
     * Dispatch destination.
     */
    destination: {
      type: String,
      required: true,
      trim: true,
    },

    /**
     * Vehicle used for dispatch, where applicable.
     */
    vehicleNumber: {
      type: String,
      trim: true,
      default: "",
    },

    /**
     * User who created/processed the dispatch.
     */
    dispatchedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    /**
     * Actual dispatch timestamp.
     */
    dispatchedAt: {
      type: Date,
      default: null,
    },

    /**
     * Dispatch lifecycle status.
     */
    status: {
      type: String,
      enum: ["Pending", "Dispatched", "Delivered"],
      default: "Pending",
      index: true,
    },

    /**
     * One or more carton photographs.
     */
    cartonPhotos: {
      type: [String],
      default: [],
    },

    /**
     * Challan photograph.
     */
    challanPhoto: {
      type: String,
      default: "",
    },

    /**
     * Optional operational notes.
     */
    notes: {
      type: String,
      default: "",
      trim: true,
    },

    /**
     * Actual delivery timestamp.
     *
     * This remains null until the dispatch is marked Delivered.
     */
    deliveredAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

/**
 * Useful compound index for retrieving all dispatches
 * belonging to a specific Production item.
 */
DispatchSchema.index({
  production: 1,
  productionItem: 1,
});

/**
 * Useful for dispatch history/reporting.
 */
DispatchSchema.index({
  status: 1,
  createdAt: -1,
});

export default mongoose.model<IDispatch>(
  "Dispatch",
  DispatchSchema,
);