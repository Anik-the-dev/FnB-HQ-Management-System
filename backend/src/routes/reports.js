import { Router } from "express";
import * as reportController from "../controllers/reportController.js";

const router = Router();

// GET /api/reports/revenue?from=2026-01-01&to=2026-02-28
router.get("/revenue", reportController.getRevenue);

// GET /api/reports/top-items/:outletId
router.get("/top-items/:outletId", reportController.getTopItems);

export default router;
