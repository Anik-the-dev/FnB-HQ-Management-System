import { Router } from "express";
import * as menuItemController from "../controllers/menuItemController.js";
import validate from "../middlewares/validate.js";
import authenticate from "../middlewares/authenticate.js";
import authorize from "../middlewares/authorize.js";
import {
  createMenuItemRules,
  updateMenuItemRules,
  listMenuItemsRules,
} from "../validators/menuItemValidator.js";

const router = Router();
router.use(authenticate);

router.get(
  "/",
  authorize("admin"),
  listMenuItemsRules,
  validate,
  menuItemController.getAll,
);

router.post(
  "/",
  authorize("admin"),
  createMenuItemRules,
  validate,
  menuItemController.create,
);

router.get("/:id", authorize("admin"), menuItemController.getById);

router.put(
  "/:id",
  authorize("admin"),
  updateMenuItemRules,
  validate,
  menuItemController.update,
);

router.delete("/:id", authorize("admin"), menuItemController.remove);

export default router;
