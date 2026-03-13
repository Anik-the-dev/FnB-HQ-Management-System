
import { body } from 'express-validator';

export const setStockRules = [
  body('quantity')
    .notEmpty().withMessage('quantity is required')
    .isInt({ min: 0 }).withMessage('quantity must be 0 or greater'),
  body('low_stock_threshold')
    .optional()
    .isInt({ min: 0 }).withMessage('low_stock_threshold must be 0 or greater'),
];

export const adjustStockRules = [
  body('adjustment')
    .notEmpty().withMessage('adjustment is required')
    .isInt().withMessage('adjustment must be an integer (positive or negative)'),
];
