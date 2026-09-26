import {
  Router,
  Request,
  Response,
  NextFunction,
} from "express";

import {
  getCatalogues,
  getCatalogueById,
  createCatalogue,
  updateCatalogue,
  deleteCatalogue,
  increaseCataloguePrice,
} from "../controllers/catalogue.controller";

import catalogueUpload from "../middlewares/catalogueUpload";
import authMiddleware from "../middlewares/auth.middleware";

const router = Router();

// ============================================================
// GET ALL
// ============================================================

router.get(
  "/",
  authMiddleware,
  getCatalogues
);

// ============================================================
// GET ONE
// ============================================================

router.get(
  "/:id",
  authMiddleware,
  getCatalogueById
);

// ============================================================
// CREATE
// ============================================================

router.post(
  "/",
  authMiddleware,

  // Upload middleware
  (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    catalogueUpload.single("image")(
      req,
      res,
      (error: any) => {
        if (error) {
          console.error(
            "================================="
          );
          console.error(
            "CATALOGUE UPLOAD ERROR"
          );
          console.error(
            "================================="
          );
          console.error(
            "NAME:",
            error?.name
          );
          console.error(
            "MESSAGE:",
            error?.message
          );
          console.error(
            "CODE:",
            error?.code
          );
          console.error(
            "FULL ERROR:",
            JSON.stringify(
              error,
              Object.getOwnPropertyNames(error),
              2
            )
          );

          return res.status(500).json({
            message:
              error?.message ||
              "Catalogue image upload failed.",
          });
        }

        next();
      }
    );
  },

  createCatalogue
);

// ============================================================
// UPDATE
// ============================================================

router.put(
  "/:id",
  authMiddleware,

  (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    catalogueUpload.single("image")(
      req,
      res,
      (error: any) => {
        if (error) {
          console.error(
            "CATALOGUE UPDATE UPLOAD ERROR:",
            error
          );

          return res.status(500).json({
            message:
              error?.message ||
              "Catalogue image upload failed.",
          });
        }

        next();
      }
    );
  },

  updateCatalogue
);

// ============================================================
// INCREASE PRICE
// ============================================================

router.patch(
  "/:id/increase-price",
  authMiddleware,
  increaseCataloguePrice
);

// ============================================================
// DELETE
// ============================================================

router.delete(
  "/:id",
  authMiddleware,
  deleteCatalogue
);

export default router;