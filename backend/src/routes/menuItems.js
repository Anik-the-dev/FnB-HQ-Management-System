import { Router } from "express";
import * as menuItemController from "../controllers/menuItemController.js";
import validate from "../middlewares/validate.js";
import {
  createMenuItemRules,
  updateMenuItemRules,
  listMenuItemsRules,
} from "../validators/menuItemValidator.js";

const router = Router();

router.get("/", listMenuItemsRules, validate, menuItemController.getAll);

router.post("/", createMenuItemRules, validate, menuItemController.create);

router.get("/:id", menuItemController.getById);

router.put("/:id", updateMenuItemRules, validate, menuItemController.update);

router.delete("/:id", menuItemController.remove);

export default router;
