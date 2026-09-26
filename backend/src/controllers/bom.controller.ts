import { Request, Response } from "express";

import BOM from "../models/BOM";
import Catalogue from "../models/Catalogue";

/*
 * ============================================================
 * HELPERS
 * ============================================================
 */

const populateBOM = (query: any) => {
  return query
    .populate("finishedProduct")
    .populate("materials.product");
};

/*
 * ============================================================
 * GET ALL BOMs
 * ============================================================
 */

export const getBOMs = async (
  req: Request,
  res: Response
) => {
  try {
    const boms = await populateBOM(
      BOM.find()
    ).sort({
      createdAt: -1,
    });

    return res.json(boms);
  } catch (error) {
    console.error(
      "GET BOMS ERROR:",
      error
    );

    return res.status(500).json({
      message: "Failed to fetch BOMs",
    });
  }
};

/*
 * ============================================================
 * GET BOM BY ID
 * ============================================================
 */

export const getBOMById = async (
  req: Request,
  res: Response
) => {
  try {
    const bom = await populateBOM(
      BOM.findById(req.params.id)
    );

    if (!bom) {
      return res.status(404).json({
        message: "BOM not found",
      });
    }

    return res.json(bom);
  } catch (error) {
    console.error(
      "GET BOM ERROR:",
      error
    );

    return res.status(500).json({
      message: "Failed to fetch BOM",
    });
  }
};

/*
 * ============================================================
 * CREATE BOM
 *
 * RULES:
 * 1. Finished Product MUST exist in Catalogue.
 * 2. Finished Product must be MANUFACTURING.
 * 3. A Catalogue product can exist without a BOM.
 * 4. A Finished Product can have only one BOM.
 * 5. Raw materials remain Inventory Products.
 * 6. Once created, Catalogue.bom points to this BOM.
 * ============================================================
 */

export const createBOM = async (
  req: Request,
  res: Response
) => {
  try {
    const {
      finishedProduct,
      materials,
    } = req.body;

    /*
     * --------------------------------------------------------
     * FINISHED PRODUCT VALIDATION
     * --------------------------------------------------------
     */

    if (!finishedProduct) {
      return res.status(400).json({
        message:
          "A catalogue finished product is required.",
      });
    }

    /*
     * Finished product comes from Catalogue,
     * NOT Inventory Product.
     */

    const catalogue =
      await Catalogue.findById(
        finishedProduct
      );

    if (!catalogue) {
      return res.status(404).json({
        message:
          "The selected finished product does not exist in the Catalogue.",
      });
    }

    /*
     * A BOM represents manufacturing.
     * Trading products cannot have a BOM.
     */

    if (
      catalogue.productType !==
      "MANUFACTURING"
    ) {
      return res.status(400).json({
        message:
          "A BOM can only be created for a manufacturing Catalogue product.",
      });
    }

    /*
     * --------------------------------------------------------
     * DUPLICATE BOM VALIDATION
     * --------------------------------------------------------
     */

    const existingBOM =
      await BOM.findOne({
        finishedProduct:
          catalogue._id,
      });

    if (existingBOM) {
      return res.status(400).json({
        message:
          "A BOM already exists for this Catalogue product.",
      });
    }

    /*
     * --------------------------------------------------------
     * MATERIAL VALIDATION
     * --------------------------------------------------------
     */

    if (
      !Array.isArray(materials) ||
      materials.length === 0
    ) {
      return res.status(400).json({
        message:
          "At least one raw material is required.",
      });
    }

    const materialIds = materials.map(
      (material: any) =>
        String(material.product)
    );

    /*
     * Duplicate raw materials are not allowed.
     */

    if (
      new Set(materialIds).size !==
      materialIds.length
    ) {
      return res.status(400).json({
        message:
          "Duplicate raw materials are not allowed.",
      });
    }

    /*
     * Validate every material.
     *
     * Materials intentionally remain Inventory
     * Product records. Catalogue is only the
     * finished-good master.
     */

    for (const material of materials) {
      if (!material.product) {
        return res.status(400).json({
          message:
            "Every BOM material must have a Product.",
        });
      }

      const quantity =
        Number(material.quantity);

      if (
        !Number.isFinite(quantity) ||
        quantity <= 0
      ) {
        return res.status(400).json({
          message:
            "Every BOM material must have a quantity greater than zero.",
        });
      }
    }

    /*
     * --------------------------------------------------------
     * CREATE BOM
     * --------------------------------------------------------
     */

    const bom = await BOM.create({
      finishedProduct:
        catalogue._id,

      materials,
    });

    /*
     * --------------------------------------------------------
     * LINK BOM BACK TO CATALOGUE
     * --------------------------------------------------------
     *
     * Catalogue → BOM is optional.
     * But once a BOM exists, the association should
     * be visible from the Catalogue product.
     */

    catalogue.bom = bom._id;

    await catalogue.save();

    /*
     * --------------------------------------------------------
     * RETURN POPULATED BOM
     * --------------------------------------------------------
     */

    const populatedBom =
      await populateBOM(
        BOM.findById(bom._id)
      );

    return res.status(201).json(
      populatedBom
    );
  } catch (error: any) {
    console.error(
      "CREATE BOM ERROR:",
      error
    );

    return res.status(500).json({
      message:
        error?.message ||
        "Failed to create BOM",
    });
  }
};

/*
 * ============================================================
 * UPDATE BOM
 *
 * Supports changing:
 * - Finished Catalogue Product
 * - Raw Materials
 *
 * Maintains Catalogue ↔ BOM relationship.
 * ============================================================
 */

export const updateBOM = async (
  req: Request,
  res: Response
) => {
  try {
    const bom =
      await BOM.findById(
        req.params.id
      );

    if (!bom) {
      return res.status(404).json({
        message: "BOM not found",
      });
    }

    const {
      finishedProduct,
      materials,
    } = req.body;

    /*
     * --------------------------------------------------------
     * FINISHED PRODUCT
     * --------------------------------------------------------
     */

    let nextFinishedProduct =
      bom.finishedProduct;

    if (
      finishedProduct !==
      undefined
    ) {
      if (!finishedProduct) {
        return res.status(400).json({
          message:
            "A catalogue finished product is required.",
        });
      }

      const catalogue =
        await Catalogue.findById(
          finishedProduct
        );

      if (!catalogue) {
        return res.status(404).json({
          message:
            "The selected finished product does not exist in the Catalogue.",
        });
      }

      if (
        catalogue.productType !==
        "MANUFACTURING"
      ) {
        return res.status(400).json({
          message:
            "A BOM can only be assigned to a manufacturing Catalogue product.",
        });
      }

      /*
       * Prevent another BOM from using
       * the same Catalogue product.
       */

      const duplicate =
        await BOM.findOne({
          finishedProduct:
            catalogue._id,
          _id: {
            $ne: bom._id,
          },
        });

      if (duplicate) {
        return res.status(400).json({
          message:
            "A BOM already exists for this Catalogue product.",
        });
      }

      nextFinishedProduct =
        catalogue._id;
    }

    /*
     * --------------------------------------------------------
     * MATERIALS
     * --------------------------------------------------------
     */

    let nextMaterials =
      bom.materials;

    if (
      materials !== undefined
    ) {
      if (
        !Array.isArray(materials) ||
        materials.length === 0
      ) {
        return res.status(400).json({
          message:
            "At least one raw material is required.",
        });
      }

      const materialIds =
        materials.map(
          (material: any) =>
            String(material.product)
        );

      if (
        new Set(materialIds).size !==
        materialIds.length
      ) {
        return res.status(400).json({
          message:
            "Duplicate raw materials are not allowed.",
        });
      }

      for (const material of materials) {
        if (!material.product) {
          return res.status(400).json({
            message:
              "Every BOM material must have a Product.",
          });
        }

        const quantity =
          Number(material.quantity);

        if (
          !Number.isFinite(quantity) ||
          quantity <= 0
        ) {
          return res.status(400).json({
            message:
              "Every BOM material must have a quantity greater than zero.",
          });
        }
      }

      nextMaterials =
        materials;
    }

    /*
     * --------------------------------------------------------
     * SAVE BOM
     * --------------------------------------------------------
     */

    const previousFinishedProduct =
      String(
        bom.finishedProduct
      );

    bom.finishedProduct =
      nextFinishedProduct;

    bom.materials =
      nextMaterials as any;

    await bom.save();

    /*
     * --------------------------------------------------------
     * UPDATE CATALOGUE LINKS
     * --------------------------------------------------------
     */

    const newFinishedProduct =
      String(
        nextFinishedProduct
      );

    /*
     * If the finished product changed,
     * remove the BOM link from the old
     * Catalogue product.
     */

    if (
      previousFinishedProduct !==
      newFinishedProduct
    ) {
      await Catalogue.findByIdAndUpdate(
        previousFinishedProduct,
        {
          $set: {
            bom: null,
          },
        }
      );
    }

    /*
     * Link BOM to the new Catalogue product.
     */

    await Catalogue.findByIdAndUpdate(
      nextFinishedProduct,
      {
        $set: {
          bom: bom._id,
        },
      }
    );

    /*
     * --------------------------------------------------------
     * RETURN POPULATED BOM
     * --------------------------------------------------------
     */

    const populatedBom =
      await populateBOM(
        BOM.findById(bom._id)
      );

    return res.json(
      populatedBom
    );
  } catch (error: any) {
    console.error(
      "UPDATE BOM ERROR:",
      error
    );

    return res.status(500).json({
      message:
        error?.message ||
        "Failed to update BOM",
    });
  }
};

/*
 * ============================================================
 * DELETE BOM
 *
 * Deleting a BOM must NOT delete the Catalogue product.
 * It only removes the manufacturing definition.
 * ============================================================
 */

export const deleteBOM = async (
  req: Request,
  res: Response
) => {
  try {
    const bom =
      await BOM.findById(
        req.params.id
      );

    if (!bom) {
      return res.status(404).json({
        message: "BOM not found",
      });
    }

    /*
     * Remove the BOM association from
     * the Catalogue product.
     */

    await Catalogue.findByIdAndUpdate(
      bom.finishedProduct,
      {
        $set: {
          bom: null,
        },
      }
    );

    /*
     * Delete only the BOM.
     * Do NOT delete the Catalogue product.
     * Do NOT delete raw-material Products.
     */

    await BOM.findByIdAndDelete(
      bom._id
    );

    return res.json({
      message: "BOM deleted",
    });
  } catch (error: any) {
    console.error(
      "DELETE BOM ERROR:",
      error
    );

    return res.status(500).json({
      message:
        error?.message ||
        "Failed to delete BOM",
    });
  }
};