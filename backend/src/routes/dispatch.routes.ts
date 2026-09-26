import { Router } from "express";

import {
  createDispatch,
  getDispatches,
  getDispatchById,
  getDispatchBalanceForItem,
  getDispatchesByProductionItem,
  updateDispatch,
} from "../controllers/dispatch.controller";

import authMiddleware from "../middlewares/auth.middleware";

const router = Router();

router.use(authMiddleware);

/* -------------------------------------------------------------------------- */
/* DISPATCH LIST                                                              */
/* -------------------------------------------------------------------------- */

router.get("/", getDispatches);

/* -------------------------------------------------------------------------- */
/* DISPATCH CREATION                                                          */
/* -------------------------------------------------------------------------- */

router.post("/", createDispatch);

/* -------------------------------------------------------------------------- */
/* DISPATCH BALANCE                                                           */
/*                                                                            */
/* GET /dispatch/production/:productionId/item/:itemId/balance                */
/*                                                                            */
/* Returns:                                                                   */
/* Ordered / Available / Dispatched / Remaining / Dispatchable                */
/* -------------------------------------------------------------------------- */

router.get(
  "/production/:productionId/item/:itemId/balance",
  getDispatchBalanceForItem,
);

/* -------------------------------------------------------------------------- */
/* DISPATCH HISTORY                                                           */
/*                                                                            */
/* GET /dispatch/production/:productionId/item/:itemId/history                */
/* -------------------------------------------------------------------------- */

router.get(
  "/production/:productionId/item/:itemId/history",
  getDispatchesByProductionItem,
);

/* -------------------------------------------------------------------------- */
/* SINGLE DISPATCH                                                            */
/* -------------------------------------------------------------------------- */

router.get("/:id", getDispatchById);

router.put("/:id", updateDispatch);

export default router;