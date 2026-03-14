import { Router } from "express";
import * as inventoryController from "../controllers/inventoryController.js";
import validate from "../middlewares/validate.js";
import authenticate from "../middlewares/authenticate.js";
import authorize from "../middlewares/authorize.js";
import {
  setStockRules,
  adjustStockRules,
} from "../validators/inventoryValidator.js";

const router = Router();
router.use(authenticate);

router.get(
  "/:outletId",
  authorize("outlet", { param: "outletId" }),
  inventoryController.getByOutlet,
);

router.put(
  "/:outletId/:menuItemId",
  authorize("outlet", { param: "outletId" }),
  setStockRules,
  validate,
  inventoryController.setStock,
);

router.patch(
  "/:outletId/:menuItemId",
  authorize("outlet", { param: "outletId" }),
  adjustStockRules,
  validate,
  inventoryController.adjustStock,
);

export default router;
