import authService from '../services/authService.js';
import asyncHandler from '../utils/asyncHandler.js';
import { sendSuccess, sendCreated } from '../utils/response.js';

const authController = {

  login: asyncHandler(async (req, res) => {
    const { username, password } = req.body;
    const result = await authService.login(username, password);
    sendSuccess(res, result, 'Login successful');
  }),

  createUser: asyncHandler(async (req, res) => {
    const user = await authService.createUser(req.body);
    sendCreated(res, user, 'User created');
  }),

  getUsers: asyncHandler(async (req, res) => {
    const users = await authService.getUsers();
    sendSuccess(res, users);
  }),

  deactivateUser: asyncHandler(async (req, res) => {
    const user = await authService.setUserActive(parseInt(req.params.id), false);
    sendSuccess(res, user, 'User deactivated');
  }),

  activateUser: asyncHandler(async (req, res) => {
    const user = await authService.setUserActive(parseInt(req.params.id), true);
    sendSuccess(res, user, 'User activated');
  }),

  me: asyncHandler(async (req, res) => {
    sendSuccess(res, req.user, 'Authenticated user');
  }),
};

export default authController;
