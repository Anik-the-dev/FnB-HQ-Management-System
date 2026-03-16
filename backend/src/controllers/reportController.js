import * as reportService from "../services/reportService.js";
import asyncHandler from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/response.js";

export const getRevenue = asyncHandler(async (req, res) => {
  const data = await reportService.getRevenueByOutlet(req.query);
  sendSuccess(res, data);
});

export const getTopItems = asyncHandler(async (req, res) => {
  const data = await reportService.getTopItemsByOutlet(
    req.params.outletId,
    req.query,
  );
  sendSuccess(res, data);
});
