import { Router } from "express";
import * as outletController from "../controllers/outletController.js";
import validate from "../middlewares/validate.js";
import authenticate from "../middlewares/authenticate.js";
import authorize from "../middlewares/authorize.js";
import {
  createOutletRules,
  updateOutletRules,
  assignMenuItemRules,
  updateAssignmentRules,
} from "../validators/outletValidator.js";

const router = Router();
router.use(authenticate);

router.get("/", outletController.getAll);
router.post(
  "/",
  authorize("admin"),
  createOutletRules,
  validate,
  outletController.create,
);
router.get(
  "/:id",
  authorize("outlet", { param: "id" }),
  outletController.getById,
);

router.put(
  "/:id",
  authorize("admin"),
  updateOutletRules,
  validate,
  outletController.update,
);

// Menu Assignments ( /api/outlets/:id/menu)

router.get(
  "/:id/menu",
  authorize("admin", "outlet", { param: "id" }),
  outletController.getOutletMenu,
);

router.post(
  "/:id/menu",
  authorize("admin"),
  assignMenuItemRules,
  validate,
  outletController.assignMenuItem,
);

router.patch(
  "/:id/menu/:menuItemId",
  authorize("admin"),
  updateAssignmentRules,
  validate,
  outletController.updateAssignment,
);

router.delete(
  "/:id/menu/:menuItemId",
  authorize("admin"),
  outletController.removeAssignment,
);

export default router;
