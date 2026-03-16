import { body } from "express-validator";

export const createSaleRules = [
  body("outlet_id")
    .notEmpty()
    .withMessage("outlet_id is required")
    .isInt({ min: 1 })
    .withMessage("outlet_id must be a positive integer"),
  body("items")
    .isArray({ min: 1 })
    .withMessage("items must be a non-empty array"),
  body("items.*.menu_item_id")
    .isInt({ min: 1 })
    .withMessage("Each item must have a valid menu_item_id"),
  body("items.*.quantity")
    .isInt({ min: 1 })
    .withMessage("Each item quantity must be at least 1"),
  body("notes")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Notes must be under 500 characters"),
];
