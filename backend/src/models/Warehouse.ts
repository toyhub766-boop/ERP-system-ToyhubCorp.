import mongoose from "mongoose";

const warehouseSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    location: {
      type: String,
      default: "",
    },

    manager: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "User",
  default: null,
},  

    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE"],
      default: "ACTIVE",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model(
  "Warehouse",
  warehouseSchema
);