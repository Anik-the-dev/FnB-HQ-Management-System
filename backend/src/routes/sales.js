import { Router } from "express";
import * as salesController from "../controllers/salesController.js";
import validate from "../middlewares/validate.js";
import { createSaleRules } from "../validators/salesValidator.js";

const router = Router();

router.post("/", createSaleRules, validate, salesController.create);

router.get("/:outletId", salesController.getByOutlet);

router.get("/:outletId/:receiptNumber", salesController.getByReceipt);

export default router;
