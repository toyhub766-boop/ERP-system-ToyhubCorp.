import mongoose, { Document, Schema } from "mongoose";

export interface ICatalogue extends Document {
  name: string;
  description?: string;
  category?: string;

  image?: string;
  images?: string[];

  modelNumber?: string;
  marka?: string;

  price?: number;
  unit?: string;
  moq?: number;

  productType: "TRADING" | "MANUFACTURING";

  // Optional BOM relationship.
  //
  // Manufacturing + BOM
  // → manufacturing product with ERP BOM
  //
  // Manufacturing + no BOM
  // → manufacturing product without ERP BOM
  //
  // Trading + no BOM
  // → trading product
  bom?: mongoose.Types.ObjectId | null;

  isActive: boolean;

  createdAt: Date;
  updatedAt: Date;
}

const CatalogueSchema = new Schema<ICatalogue>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
    },

    // Independent Catalogue category.
    // Does NOT reference Inventory Category.
    category: {
      type: String,
      trim: true,
    },

    image: {
      type: String,
      trim: true,
    },

    images: [
      {
        type: String,
        trim: true,
      },
    ],

    // Product model number.
    modelNumber: {
      type: String,
      trim: true,
    },

    // Marka / Mark / brand identification.
    marka: {
      type: String,
      trim: true,
    },

    price: {
      type: Number,
      min: 0,
    },

    unit: {
      type: String,
      trim: true,
    },

    moq: {
      type: Number,
      min: 1,
      default: 1,
    },

    // Catalogue-level product classification.
    productType: {
      type: String,
      enum: ["TRADING", "MANUFACTURING"],
      default: "MANUFACTURING",
      required: true,
    },

    // Optional BOM relationship.
    //
    // A manufacturing product does NOT require a BOM.
    bom: {
      type: Schema.Types.ObjectId,
      ref: "BOM",
      default: null,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<ICatalogue>(
  "Catalogue",
  CatalogueSchema
);