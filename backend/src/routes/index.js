import { Router } from "express";
import companyRoutes from "./companies.js";
import outletRoutes from "./outlets.js";
import menuItemRoutes from "./menuItems.js";
import inventoryRoutes from "./inventory.js";
import salesRoutes from "./sales.js";
import reportRoutes from "./reports.js";

const router = Router();

router.use("/companies", companyRoutes);
router.use("/outlets", outletRoutes);
router.use("/menu-items", menuItemRoutes);
router.use("/inventory", inventoryRoutes);
router.use("/sales", salesRoutes);
router.use("/reports", reportRoutes);

export default router;
