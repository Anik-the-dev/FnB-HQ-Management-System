import companyService from "../services/company.js";
import asyncHandler from "../utils/asyncHandler.js";
import { sendSuccess, sendCreated } from "../utils/response.js";

export const getAll = asyncHandler(async (req, res) => {
  const data = await companyService.getAllCompanies();
  sendSuccess(res, data);
});

export const getById = asyncHandler(async (req, res) => {
  const data = await companyService.getCompanyById(req.params.id);
  sendSuccess(res, data);
});

export const create = asyncHandler(async (req, res) => {
  const { name } = req.body;
  const data = await companyService.createCompany(name);
  sendCreated(res, data, "Company created successfully");
});

export const update = asyncHandler(async (req, res) => {
  const { name } = req.body;
  const data = await companyService.updateCompany(req.params.id, name);
  sendSuccess(res, data, "Company updated successfully");
});
