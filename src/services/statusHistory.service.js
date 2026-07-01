import * as repository from "../repositories/statusHistory.repository.js";

export const create = async (ticketId, oldStatus, newStatus, user) => {
  return await repository.createHistory({
    ticketId,
    fromStatus: oldStatus,
    toStatus: newStatus,
    changedBy: user.id,
  });
};

export const getAll = async (ticketId) => {
  return await repository.getHistory(ticketId);
};
