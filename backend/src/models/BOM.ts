import mongoose, { Document, Schema } from "mongoose";

export interface IBOMMaterial {
  product: mongoose.Types.ObjectId;
  quantity: number;
}

export interface IBOM extends Document {
  finishedProduct: mongoose.Types.ObjectId;
  materials: IBOMMaterial[];
  createdAt: Date;
  updatedAt: Date;
}

const BOMSchema = new Schema(
  {
    finishedProduct: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
      unique: true,
    },

    materials: [
      {
        product: {
          type: Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },

        quantity: {
          type: Number,
          required: true,
          min: 0,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IBOM>("BOM", BOMSchema);