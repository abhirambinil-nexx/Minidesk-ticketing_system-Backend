import * as repository from "../repositories/dashboard.repository.js";

export const getDashboard = async () => {
  return await repository.getDashboardStats();
};