import { Router } from "express";
import * as salesController from "../controllers/salesController.js";
import validate from "../middlewares/validate.js";
import authenticate from "../middlewares/authenticate.js";
import authorize from "../middlewares/authorize.js";
import { createSaleRules } from "../validators/salesValidator.js";

const router = Router();
router.use(authenticate);

router.post(
  "/",
  authorize("outlet", { param: "outletId" }),
  createSaleRules,
  validate,
  salesController.create,
);

router.get(
  "/:outletId",
  authorize("outlet", { param: "outletId" }),
  salesController.getByOutlet,
);

router.get(
  "/:outletId/:receiptNumber",
  authorize("outlet", { param: "outletId" }),
  salesController.getByReceipt,
);

export default router;
