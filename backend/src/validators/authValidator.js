import { body } from 'express-validator';

export const loginRules = [
  body('username').trim().notEmpty().withMessage('Username is required.'),
  body('password').notEmpty().withMessage('Password is required.'),
];

export const createUserRules = [
  body('username')
    .trim().notEmpty().withMessage('Username is required.')
    .isLength({ min: 3, max: 50 }).withMessage('Username must be 3–50 characters.'),
  body('password')
    .notEmpty().withMessage('Password is required.')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters.'),
  body('role')
    .notEmpty().withMessage('Role is required.')
    .isIn(['admin', 'outlet']).withMessage('Role must be admin or outlet.'),
  body('outlet_id')
    .if(body('role').equals('outlet'))
    .notEmpty().withMessage('outlet_id is required for outlet role.')
    .isInt({ min: 1 }).withMessage('outlet_id must be a positive integer.'),
];
