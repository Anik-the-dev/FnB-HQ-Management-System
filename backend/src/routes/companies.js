import { Router } from "express";
import * as companyController from "../controllers/company.js";
import validate from "../middlewares/validate.js";
import {
  createCompanyRules,
  updateCompanyRules,
} from "../validators/company.js";

const router = Router();


router.get("/", companyController.getAll);
router.get("/:id", companyController.getById);
router.post("/", createCompanyRules, validate, companyController.create);
router.put("/:id", updateCompanyRules, validate, companyController.update);

export default router;
