import { Router } from "express";
import * as reportController from "../controllers/reportController.js";
import authenticate from "../middlewares/authenticate.js";
import authorize from "../middlewares/authorize.js";

const router = Router();
router.use(authenticate);
// GET /api/reports/revenue?from=2026-01-01&to=2026-02-28
router.get("/revenue", authorize("admin"), reportController.getRevenue);

// GET /api/reports/top-items/:outletId
router.get(
  "/top-items/:outletId",
  authorize("admin"),
  reportController.getTopItems,
);

export default router;
