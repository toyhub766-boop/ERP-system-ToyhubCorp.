import { Request, Response } from "express";

import Catalogue from "../models/Catalogue";

// GET all catalogue products
export const getCatalogues = async (
  req: Request,
  res: Response
) => {
  try {
    const catalogues = await Catalogue.find()
      .sort({ createdAt: -1 });

    return res.status(200).json(catalogues);
  } catch (error) {
    console.error("Get catalogue error:", error);

    return res.status(500).json({
      message: "Failed to fetch catalogue products.",
    });
  }
};

// GET single catalogue product
export const getCatalogueById = async (
  req: Request,
  res: Response
) => {
  try {
    const catalogue = await Catalogue.findById(
      req.params.id
    );

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

// CREATE catalogue product
export const createCatalogue = async (
  req: Request,
  res: Response
) => {
  try {
    const {
      name,
      description,
      category,
      price,
      unit,
      isActive,
    } = req.body;

    if (!name?.trim()) {
      return res.status(400).json({
        message: "Product name is required.",
      });
    }

    const file = (req as any).file;

    const catalogue = await Catalogue.create({
      name: name.trim(),
      description,
      category,
      price:
        price !== undefined && price !== ""
          ? Number(price)
          : undefined,
      unit,
      isActive:
        isActive === undefined
          ? true
          : isActive === "false"
          ? false
          : Boolean(isActive),

      // Cloudinary URL
      image: file ? file.path : "",
    });

    return res.status(201).json(catalogue);
  } catch (error: any) {
    console.error("CREATE CATALOGUE ERROR:");
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

// UPDATE catalogue product
export const updateCatalogue = async (
  req: Request,
  res: Response
) => {
  try {
    const updateData: any = {
      ...req.body,
    };

    if (
      updateData.price !== undefined &&
      updateData.price !== ""
    ) {
      updateData.price = Number(updateData.price);
    }

    const file = (req as any).file;

    // Only replace image if a new image was uploaded
    if (file) {
      updateData.image = file.path;
    }

    const catalogue =
      await Catalogue.findByIdAndUpdate(
        req.params.id,
        updateData,
        {
          new: true,
          runValidators: true,
        }
      );

    if (!catalogue) {
      return res.status(404).json({
        message: "Catalogue product not found.",
      });
    }

    return res.status(200).json(catalogue);
  } catch (error: any) {
    console.error("UPDATE CATALOGUE ERROR:");
    console.error(error);

    return res.status(500).json({
      message:
        error?.message ||
        "Failed to update catalogue product.",
    });
  }
};

// DELETE catalogue product
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
        message: "Catalogue product not found.",
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