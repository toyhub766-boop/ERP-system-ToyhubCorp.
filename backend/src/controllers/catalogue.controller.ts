import { Request, Response } from "express";

import Catalogue from "../models/Catalogue";
import BOM from "../models/BOM";

// ============================================================
// GET ALL CATALOGUE PRODUCTS
// ============================================================

export const getCatalogues = async (
  req: Request,
  res: Response
) => {
  try {
    const catalogues = await Catalogue.find()
      .populate({
        path: "bom",
        select: "finishedProduct",
        populate: {
          path: "finishedProduct",
          select: "name sku unit image",
        },
      })
      .sort({ createdAt: -1 });

    return res.status(200).json(catalogues);
  } catch (error) {
    console.error("Get catalogue error:", error);

    return res.status(500).json({
      message: "Failed to fetch catalogue products.",
    });
  }
};

// ============================================================
// GET SINGLE CATALOGUE PRODUCT
// ============================================================

export const getCatalogueById = async (
  req: Request,
  res: Response
) => {
  try {
    const catalogue = await Catalogue.findById(
      req.params.id
    ).populate({
      path: "bom",
      select: "finishedProduct",
      populate: {
        path: "finishedProduct",
        select: "name sku unit image",
      },
    });

    if (!catalogue) {
      return res.status(404).json({
        message: "Catalogue product not found.",
      });
    }

    return res.status(200).json(catalogue);
  } catch (error) {
    console.error(
      "Get catalogue product error:",
      error
    );

    return res.status(500).json({
      message: "Failed to fetch catalogue product.",
    });
  }
};

// ============================================================
// CREATE CATALOGUE PRODUCT
// ============================================================

export const createCatalogue = async (
  req: Request,
  res: Response
) => {
  try {
    const {
      name,
      description,
      category,
      modelNumber,
      marka,
      price,
      unit,
      moq,
      productType,
      isActive,
      bom,
    } = req.body;

    // --------------------------------------------------------
    // BASIC VALIDATION
    // --------------------------------------------------------

    if (!name?.trim()) {
      return res.status(400).json({
        message: "Product name is required.",
      });
    }

    if (
      productType !== "TRADING" &&
      productType !== "MANUFACTURING"
    ) {
      return res.status(400).json({
        message:
          "Product type must be TRADING or MANUFACTURING.",
      });
    }

    // --------------------------------------------------------
    // MOQ VALIDATION
    // --------------------------------------------------------

    const parsedMOQ =
      moq === undefined || moq === ""
        ? 1
        : Number(moq);

    if (
      !Number.isInteger(parsedMOQ) ||
      parsedMOQ < 1
    ) {
      return res.status(400).json({
        message: "MOQ must be a positive whole number.",
      });
    }

    // --------------------------------------------------------
    // PRICE VALIDATION
    // --------------------------------------------------------

    let parsedPrice: number | undefined;

    if (price !== undefined && price !== "") {
      parsedPrice = Number(price);

      if (
        Number.isNaN(parsedPrice) ||
        parsedPrice < 0
      ) {
        return res.status(400).json({
          message: "Price must be a valid non-negative number.",
        });
      }
    }

    // --------------------------------------------------------
    // BOM VALIDATION
    // --------------------------------------------------------

    let bomId = null;

    if (bom && bom.trim() !== "") {
      // Trading products cannot have a BOM.
      if (productType === "TRADING") {
        return res.status(400).json({
          message:
            "Trading products cannot have a BOM.",
        });
      }

      const existingBOM = await BOM.findById(bom);

      if (!existingBOM) {
        return res.status(400).json({
          message: "Selected BOM not found.",
        });
      }

      bomId = bom;
    }

    // --------------------------------------------------------
    // IMAGE
    // --------------------------------------------------------

    const file = (req as any).file;

    // --------------------------------------------------------
    // CREATE
    // --------------------------------------------------------

    const catalogue = await Catalogue.create({
      name: name.trim(),
      description,
      category,

      modelNumber:
        modelNumber?.trim() || undefined,

      marka:
        marka?.trim() || undefined,

      price: parsedPrice,

      unit,

      moq: parsedMOQ,

      productType,

      isActive:
        isActive === undefined
          ? true
          : isActive === "false"
            ? false
            : Boolean(isActive),

      // BOM is optional.
      bom: bomId,

      image: file ? file.path : "",
    });

    // --------------------------------------------------------
    // RETURN POPULATED RESULT
    // --------------------------------------------------------

    const populatedCatalogue =
      await Catalogue.findById(
        catalogue._id
      ).populate({
        path: "bom",
        select: "finishedProduct",
        populate: {
          path: "finishedProduct",
          select: "name sku unit image",
        },
      });

    return res.status(201).json(
      populatedCatalogue
    );
  } catch (error: any) {
    console.error(
      "CREATE CATALOGUE ERROR:"
    );

    console.error(error);
    console.error(error?.message);
    console.error(error?.errors);

    return res.status(500).json({
      message:
        error?.message ||
        "Failed to create catalogue product.",
    });
  }
};

// ============================================================
// UPDATE CATALOGUE PRODUCT
// ============================================================

export const updateCatalogue = async (
  req: Request,
  res: Response
) => {
  try {
    const updateData: any = {
      ...req.body,
    };

    // --------------------------------------------------------
    // PRICE
    // --------------------------------------------------------

    if (
      updateData.price !== undefined &&
      updateData.price !== ""
    ) {
      const parsedPrice = Number(
        updateData.price
      );

      if (
        Number.isNaN(parsedPrice) ||
        parsedPrice < 0
      ) {
        return res.status(400).json({
          message:
            "Price must be a valid non-negative number.",
        });
      }

      updateData.price = parsedPrice;
    }

    // --------------------------------------------------------
    // MOQ
    // --------------------------------------------------------

    if (
      updateData.moq !== undefined &&
      updateData.moq !== ""
    ) {
      const parsedMOQ = Number(
        updateData.moq
      );

      if (
        !Number.isInteger(parsedMOQ) ||
        parsedMOQ < 1
      ) {
        return res.status(400).json({
          message:
            "MOQ must be a positive whole number.",
        });
      }

      updateData.moq = parsedMOQ;
    } else if (
      updateData.moq === ""
    ) {
      updateData.moq = 1;
    }

    // --------------------------------------------------------
    // PRODUCT TYPE
    // --------------------------------------------------------

    if (
      updateData.productType !== undefined &&
      updateData.productType !== "TRADING" &&
      updateData.productType !== "MANUFACTURING"
    ) {
      return res.status(400).json({
        message:
          "Product type must be TRADING or MANUFACTURING.",
      });
    }

    // --------------------------------------------------------
    // TEXT FIELDS
    // --------------------------------------------------------

    if (
      updateData.modelNumber !== undefined
    ) {
      updateData.modelNumber =
        updateData.modelNumber.trim();
    }

    if (
      updateData.marka !== undefined
    ) {
      updateData.marka =
        updateData.marka.trim();
    }

    // --------------------------------------------------------
    // BOM
    // --------------------------------------------------------

    if (updateData.bom !== undefined) {
      // Empty/null = remove BOM.
      if (
        updateData.bom === "" ||
        updateData.bom === null
      ) {
        updateData.bom = null;
      } else {
        const existingBOM =
          await BOM.findById(
            updateData.bom
          );

        if (!existingBOM) {
          return res.status(400).json({
            message:
              "Selected BOM not found.",
          });
        }
      }
    }

    // --------------------------------------------------------
    // TRADING PRODUCTS CANNOT HAVE BOM
    // --------------------------------------------------------

    if (
      updateData.productType ===
      "TRADING"
    ) {
      updateData.bom = null;
    }

    // --------------------------------------------------------
    // IMAGE
    // --------------------------------------------------------

    const file = (req as any).file;

    if (file) {
      updateData.image = file.path;
    }

    // --------------------------------------------------------
    // UPDATE
    // --------------------------------------------------------

    const catalogue =
      await Catalogue.findByIdAndUpdate(
        req.params.id,
        updateData,
        {
          new: true,
          runValidators: true,
        }
      ).populate({
        path: "bom",
        select: "finishedProduct",
        populate: {
          path: "finishedProduct",
          select: "name sku unit image",
        },
      });

    if (!catalogue) {
      return res.status(404).json({
        message:
          "Catalogue product not found.",
      });
    }

    return res.status(200).json(
      catalogue
    );
  } catch (error: any) {
    console.error(
      "UPDATE CATALOGUE ERROR:"
    );

    console.error(error);

    return res.status(500).json({
      message:
        error?.message ||
        "Failed to update catalogue product.",
    });
  }
};


// ============================================================
// INCREASE CATALOGUE PRICE BY PERCENTAGE
// ============================================================

export const increaseCataloguePrice = async (
  req: Request,
  res: Response
) => {
  try {
    const percentage = Number(req.body?.percentage);

    if (
      !Number.isFinite(percentage) ||
      percentage <= 0
    ) {
      return res.status(400).json({
        message: "Percentage must be greater than 0.",
      });
    }

    const catalogue = await Catalogue.findById(req.params.id);

    if (!catalogue) {
      return res.status(404).json({
        message: "Catalogue product not found.",
      });
    }

    if (catalogue.price === undefined || catalogue.price === null) {
      return res.status(400).json({
        message: "This catalogue product does not have a price.",
      });
    }

    const newPrice = Number(
      (catalogue.price * (1 + percentage / 100)).toFixed(2)
    );

    catalogue.price = newPrice;
    await catalogue.save();

    const populatedCatalogue = await Catalogue.findById(
      catalogue._id
    ).populate({
      path: "bom",
      select: "finishedProduct",
      populate: {
        path: "finishedProduct",
        select: "name sku unit image",
      },
    });

    return res.status(200).json(populatedCatalogue);
  } catch (error: any) {
    console.error("INCREASE CATALOGUE PRICE ERROR:", error);

    return res.status(500).json({
      message:
        error?.message ||
        "Failed to increase catalogue price.",
    });
  }
};

// ============================================================
// DELETE CATALOGUE PRODUCT
// ============================================================

export const deleteCatalogue = async (
  req: Request,
  res: Response
) => {
  try {
    const catalogue =
      await Catalogue.findByIdAndDelete(
        req.params.id
      );

    if (!catalogue) {
      return res.status(404).json({
        message:
          "Catalogue product not found.",
      });
    }

    return res.status(200).json({
      message:
        "Catalogue product deleted successfully.",
    });
  } catch (error) {
    console.error(
      "Delete catalogue error:",
      error
    );

    return res.status(500).json({
      message:
        "Failed to delete catalogue product.",
    });
  }
};