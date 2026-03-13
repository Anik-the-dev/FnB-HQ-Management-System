import * as inventoryService from '../services/inventoryService.js';
import asyncHandler     from '../utils/asyncHandler.js';
import { sendSuccess }  from '../utils/response.js';

export const getByOutlet = asyncHandler(async (req, res) => {
  const data = await inventoryService.getOutletInventory(req.params.outletId);
  sendSuccess(res, data);
});

export const setStock = asyncHandler(async (req, res) => {
  const { outletId, menuItemId } = req.params;
  const { quantity, low_stock_threshold } = req.body;
  const data = await inventoryService.setStock(outletId, menuItemId, quantity, low_stock_threshold);
  sendSuccess(res, data, 'Stock updated successfully');
});

export const adjustStock = asyncHandler(async (req, res) => {
  const { outletId, menuItemId } = req.params;
  const { adjustment } = req.body;
  const data = await inventoryService.adjustStock(outletId, menuItemId, adjustment);
  sendSuccess(res, data, 'Stock adjusted successfully');
});

