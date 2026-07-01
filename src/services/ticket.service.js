import {
  createTicket,
  getAllTickets,
  getRequesterTickets,
  getTicketById,
  updateTicket,
  deleteTicket,
} from "../repositories/ticket.repository.js";
import * as statusHistoryService from "./statusHistory.service.js";

export const create = async (data, user) => {
  return await createTicket({
    ...data,
    requesterId: user.id,
  });
};

export const getAll = async (user) => {
  if (user.role === "requester") {
    return await getRequesterTickets(user.id);
  }

  return await getAllTickets();
};

export const getOne = async (id) => {
  return await getTicketById(id);
};

export const update = async (id, data, user) => {
  const ticket = await getTicketById(id);

  const oldStatus = ticket.status;

  const updatedTicket = await updateTicket(id, data);

  if (data.status && oldStatus !== data.status) {
    await statusHistoryService.create(ticket.id, oldStatus, data.status, user);
  }

  return updatedTicket;
};

export const remove = async (id) => {
  return await deleteTicket(id);
};
