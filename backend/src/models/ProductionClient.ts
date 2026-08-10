import mongoose, {
  Document,
  Schema,
} from "mongoose";

export interface IProductionClient
  extends Document {
  name: string;
  contactPerson: string;
  phone: string;
  address: string;
  transport: string;
  notes: string;

  createdAt: Date;
  updatedAt: Date;
}

const ProductionClientSchema =
  new Schema(
    {
      name: {
        type: String,
        required: true,
        trim: true,
      },

      contactPerson: {
        type: String,
        default: "",
        trim: true,
      },

      phone: {
        type: String,
        default: "",
        trim: true,
      },

      address: {
        type: String,
        default: "",
        trim: true,
      },

      transport: {
        type: String,
        default: "",
        trim: true,
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

export default mongoose.model<IProductionClient>(
  "ProductionClient",
  ProductionClientSchema
);