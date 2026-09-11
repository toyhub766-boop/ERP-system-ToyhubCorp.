import mongoose, { Document, Schema } from "mongoose";

export interface ICatalogue extends Document {
  name: string;
  description?: string;
  category?: string;
  image?: string;
  images?: string[];
  price?: number;
  unit?: string;
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

    // Independent catalogue category.
    // This does NOT reference the Inventory Category model.
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

    price: {
      type: Number,
      min: 0,
    },

    unit: {
      type: String,
      trim: true,
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