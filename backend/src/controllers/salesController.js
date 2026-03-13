// src/controllers/sales.controller.js
import * as salesService from '../services/salesService.js';
import asyncHandler from '../utils/asyncHandler.js';
import { sendSuccess, sendCreated, sendError } from '../utils/response.js';

export const create = asyncHandler(async (req, res) => {
  try {
    const data = await salesService.createSale(req.body);
    sendCreated(res, data, 'Sale created successfully');
  } catch (err) {
    // Surface stock errors with details
    if (err.statusCode === 400 && err.details) {
      return sendError(res, err.message, 400, err.details);
    }
    throw err;
  }
});

export const getByOutlet = asyncHandler(async (req, res) => {
  const data = await salesService.getSalesByOutlet(req.params.outletId, req.query);
  sendSuccess(res, data);
});

export const getByReceipt = asyncHandler(async (req, res) => {
  const { outletId, receiptNumber } = req.params;
  const data = await salesService.getSaleByReceipt(outletId, receiptNumber);
  sendSuccess(res, data);
});

