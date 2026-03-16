import { body, query } from 'express-validator';

export const createMenuItemRules = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ max: 255 }).withMessage('Name must be under 255 characters'),
  body('base_price')
    .notEmpty().withMessage('base_price is required')
    .isFloat({ min: 0 }).withMessage('base_price must be 0 or greater'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 }).withMessage('Description must be under 1000 characters'),
  body('category')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Category must be under 100 characters'),
];

export const updateMenuItemRules = [
  body('name')
    .optional()
    .trim()
    .notEmpty().withMessage('Name cannot be empty')
    .isLength({ max: 255 }).withMessage('Name must be under 255 characters'),
  body('base_price')
    .optional()
    .isFloat({ min: 0 }).withMessage('base_price must be 0 or greater'),
  body('description')
    .optional()
    .trim(),
  body('category')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Category must be under 100 characters'),
  body('is_active')
    .optional()
    .isBoolean().withMessage('is_active must be a boolean'),
];

export const listMenuItemsRules = [
  query('category').optional().trim(),
  query('isActive').optional().isBoolean().withMessage('isActive must be true or false'),
];
