import * as menuItemService from '../services/menuItemService.js';
import asyncHandler    from '../utils/asyncHandler.js';
import { sendSuccess, sendCreated } from '../utils/response.js';

export const getAll = asyncHandler(async (req, res) => {
  const data = await menuItemService.getAllMenuItems(req.query);
  sendSuccess(res, data);
});

export const getById = asyncHandler(async (req, res) => {
  const data = await menuItemService.getMenuItemById(req.params.id);
  sendSuccess(res, data);
});

export const create = asyncHandler(async (req, res) => {
  const data = await menuItemService.createMenuItem(req.body);
  sendCreated(res, data, 'Menu item created successfully');
});

export const update = asyncHandler(async (req, res) => {
  const data = await menuItemService.updateMenuItem(req.params.id, req.body);
  sendSuccess(res, data, 'Menu item updated successfully');
});

export const remove = asyncHandler(async (req, res) => {
  const data = await menuItemService.deleteMenuItem(req.params.id);
  sendSuccess(res, data, 'Menu item deleted successfully');
});

