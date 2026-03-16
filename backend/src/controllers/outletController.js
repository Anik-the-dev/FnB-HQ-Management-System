
import * as outletService from '../services/outletService.js';
import asyncHandler  from '../utils/asyncHandler.js';
import { sendSuccess, sendCreated } from '../utils/response.js';

export const getAll = asyncHandler(async (req, res) => {
  const data = await outletService.getAllOutlets();
  sendSuccess(res, data);
});

export const getById = asyncHandler(async (req, res) => {
  const data = await outletService.getOutletById(req.params.id);
  sendSuccess(res, data);
});

export const create = asyncHandler(async (req, res) => {
  const data = await outletService.createOutlet(req.body);
  sendCreated(res, data, 'Outlet created successfully');
});

export const update = asyncHandler(async (req, res) => {
  const data = await outletService.updateOutlet(req.params.id, req.body);
  sendSuccess(res, data, 'Outlet updated successfully');
});

// Menu Assignment

export const getOutletMenu = asyncHandler(async (req, res) => {
  const data = await outletService.getOutletMenu(req.params.id);
  sendSuccess(res, data);
});

export const assignMenuItem = asyncHandler(async (req, res) => {
  const data = await outletService.assignMenuItemToOutlet(req.params.id, req.body);
  sendCreated(res, data, 'Menu item assigned to outlet');
});

export const updateAssignment = asyncHandler(async (req, res) => {
  const { id, menuItemId } = req.params;
  const data = await outletService.updateOutletMenuItemAssignment(id, menuItemId, req.body);
  sendSuccess(res, data, 'Assignment updated');
});

export const removeAssignment = asyncHandler(async (req, res) => {
  const { id, menuItemId } = req.params;
  await outletService.removeOutletMenuItemAssignment(id, menuItemId);
  sendSuccess(res, null, 'Menu item removed from outlet');
});
