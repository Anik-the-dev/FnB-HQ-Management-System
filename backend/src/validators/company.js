import { body } from "express-validator";

export const createCompanyRules = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Company name is required")
    .isLength({ max: 255 })
    .withMessage("Name must be under 255 characters"),
];

export const updateCompanyRules = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Company name is required")
    .isLength({ max: 255 })
    .withMessage("Name must be under 255 characters"),
];
