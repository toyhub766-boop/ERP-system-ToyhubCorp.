import mongoose, {
  Document,
  Schema,
} from "mongoose";

/*
 * ============================================================
 * BOM MATERIAL
 *
 * Raw materials remain Inventory Products.
 * ============================================================
 */

export interface IBOMMaterial {
  product: mongoose.Types.ObjectId;
  quantity: number;
}

/*
 * ============================================================
 * BOM
 * ============================================================
 *
 * finishedProduct → Catalogue
 *
 * materials.product → Inventory Product
 */

export interface IBOM extends Document {
  finishedProduct: mongoose.Types.ObjectId;
  materials: IBOMMaterial[];
  createdAt: Date;
  updatedAt: Date;
}

const BOMSchema =
  new Schema<IBOM>(
    {
      /*
       * ------------------------------------------------------
       * FINISHED PRODUCT
       * ------------------------------------------------------
       *
       * IMPORTANT:
       * This is Catalogue, NOT Inventory Product.
       *
       * Catalogue product may exist without a BOM.
       * But every BOM must belong to a Catalogue product.
       */

      finishedProduct: {
        type: Schema.Types.ObjectId,
        ref: "Catalogue",
        required: true,
        unique: true,
      },

      /*
       * ------------------------------------------------------
       * RAW MATERIALS
       * ------------------------------------------------------
       *
       * Raw materials continue to come from
       * the Inventory Product system.
       */

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

const BOM =
  mongoose.model<IBOM>(
    "BOM",
    BOMSchema
  );

export default BOM;