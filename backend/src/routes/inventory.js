import { Router } from "express";
import * as inventoryController from "../controllers/inventoryController.js";
import validate from "../middlewares/validate.js";
import {
  setStockRules,
  adjustStockRules,
} from "../validators/inventoryValidator.js";

const router = Router();

router.get("/:outletId", inventoryController.getByOutlet);

router.put(
  "/:outletId/:menuItemId",
  setStockRules,
  validate,
  inventoryController.setStock,
);

router.patch(
  "/:outletId/:menuItemId",
  adjustStockRules,
  validate,
  inventoryController.adjustStock,
);

export default router;
