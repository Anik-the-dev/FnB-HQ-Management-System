import * as reportRepo from '../repositories/reportRepository.js';

export const getRevenueByOutlet = async (query) => {
  const { from, to } = query;
  return reportRepo.getRevenueByOutlet({ from, to });
};

export const getTopItemsByOutlet = async (outletId, query) => {
  return reportRepo.getTopItemsByOutlet(outletId, query);
};
