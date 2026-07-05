import mongoose, { Schema, Document } from "mongoose";

export interface IMaterialConsumption extends Document {
  production: mongoose.Types.ObjectId;
  material: mongoose.Types.ObjectId;
  requiredQuantity: number;
}

const MaterialConsumptionSchema = new Schema(
  {
    production: {
      type: Schema.Types.ObjectId,
      ref: "Production",
      required: true,
    },

    material: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    requiredQuantity: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IMaterialConsumption>(
  "MaterialConsumption",
  MaterialConsumptionSchema
);