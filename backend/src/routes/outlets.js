import { Router } from "express";
import * as outletController from "../controllers/outletController.js";
import validate from "../middlewares/validate.js";
import {
  createOutletRules,
  updateOutletRules,
  assignMenuItemRules,
  updateAssignmentRules,
} from "../validators/outletValidator.js";

const router = Router();

router.get("/", outletController.getAll);
router.post("/", createOutletRules, validate, outletController.create);
router.get("/:id", outletController.getById);

router.put("/:id", updateOutletRules, validate, outletController.update);

// Menu Assignments ( /api/outlets/:id/menu)

router.get("/:id/menu", outletController.getOutletMenu);

router.post(
  "/:id/menu",
  assignMenuItemRules,
  validate,
  outletController.assignMenuItem,
);

router.patch(
  "/:id/menu/:menuItemId",
  updateAssignmentRules,
  validate,
  outletController.updateAssignment,
);

router.delete("/:id/menu/:menuItemId", outletController.removeAssignment);

export default router;
