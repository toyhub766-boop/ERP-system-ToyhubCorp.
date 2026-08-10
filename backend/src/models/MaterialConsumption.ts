import mongoose, {
  Document,
  Schema,
} from "mongoose";

export interface IMaterialConsumption
  extends Document {
  production: mongoose.Types.ObjectId;

  productionItem: mongoose.Types.ObjectId;

  material: mongoose.Types.ObjectId;

  requiredQuantity: number;

  createdAt: Date;
  updatedAt: Date;
}

const MaterialConsumptionSchema =
  new Schema(
    {
      production: {
        type: Schema.Types.ObjectId,
        ref: "Production",
        required: true,
      },

      productionItem: {
        type: Schema.Types.ObjectId,
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
        min: 0,
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