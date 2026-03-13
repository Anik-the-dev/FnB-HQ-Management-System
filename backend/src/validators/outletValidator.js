
import { body } from 'express-validator';

export const createOutletRules = [
  body('name')
    .trim()
    .notEmpty().withMessage('Outlet name is required')
    .isLength({ max: 255 }).withMessage('Name must be under 255 characters'),
  body('location')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Location must be under 500 characters'),
];

export const updateOutletRules = [
  body('name')
    .optional()
    .trim()
    .notEmpty().withMessage('Name cannot be empty')
    .isLength({ max: 255 }).withMessage('Name must be under 255 characters'),
  body('location')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Location must be under 500 characters'),
  body('is_active')
    .optional()
    .isBoolean().withMessage('is_active must be a boolean'),
];

export const assignMenuItemRules = [
  body('menu_item_id')
    .notEmpty().withMessage('menu_item_id is required')
    .isInt({ min: 1 }).withMessage('menu_item_id must be a positive integer'),
  body('override_price')
    .optional({ nullable: true })
    .isFloat({ min: 0 }).withMessage('override_price must be a positive number'),
];

export const updateAssignmentRules = [
  body('override_price')
    .optional({ nullable: true })
    .isFloat({ min: 0 }).withMessage('override_price must be a positive number'),
  body('is_available')
    .optional()
    .isBoolean().withMessage('is_available must be a boolean'),
];
