import { Router }    from 'express';
import controller    from '../controllers/authController.js';
import validate      from '../middlewares/validate.js';
import authenticate  from '../middlewares/authenticate.js';
import authorize     from '../middlewares/authorize.js';
import { loginRules, createUserRules } from '../validators/authValidator.js';

const router = Router();

// POST /api/auth/login  — public
router.post('/login', loginRules, validate, controller.login);

// GET  /api/auth/me  — any logged-in user
router.get('/me', authenticate, controller.me);

// POST /api/auth/users  — admin only: create a user
router.post('/users', authenticate, authorize('admin'), createUserRules, validate, controller.createUser);

// GET  /api/auth/users  — admin only: list all users
router.get('/users', authenticate, authorize('admin'), controller.getUsers);

// PATCH /api/auth/users/:id/deactivate  — admin only
router.patch('/users/:id/deactivate', authenticate, authorize('admin'), controller.deactivateUser);

// PATCH /api/auth/users/:id/activate  — admin only
router.patch('/users/:id/activate', authenticate, authorize('admin'), controller.activateUser);

export default router;
