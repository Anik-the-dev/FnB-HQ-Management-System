import * as companyRepo from "../repositories/companyRepository.js";

const getAllCompanies = () => companyRepo.findAll();

const getCompanyById = async (id) => {
  const company = await companyRepo.findById(id);
  if (!company) {
    const err = new Error("Company not found");
    err.statusCode = 404;
    throw err;
  }
  return company;
};

const createCompany = async (name) => {
  return companyRepo.create(name);
};

const updateCompany = async (id, name) => {
  const company = await companyRepo.update(id, name);
  if (!company) {
    const err = new Error("Company not found");
    err.statusCode = 404;
    throw err;
  }
  return company;
};

export default {
  getAllCompanies,
  getCompanyById,
  createCompany,
  updateCompany,
};
