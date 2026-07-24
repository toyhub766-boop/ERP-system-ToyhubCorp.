import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    type: {
      type: String,
      enum: ["FINISHED", "RAW"],
      default: "RAW",
      required: true,
    },

    sku: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },

    warehouse: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Warehouse",
      required: true,
    },

    unit: {
      type: String,
      default: "PCS",
    },

    minimumStock: {
      type: Number,
      default: 0,
    },

    currentStock: {
      type: Number,
      default: 0,
    },

    status: {
      type: String,
      enum: ["Healthy", "Low Stock", "Critical"],
      default: "Healthy",
    },

    image: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("Product", productSchema);
