import Ticket from "../models/Ticket.js";

export const createTicket = async (ticketData) => {
  return await Ticket.create(ticketData);
};

export const getAllTickets = async () => {
  return await Ticket.findAll();
};

export const getTicketById = async (id) => {
  return await Ticket.findByPk(id);
};

export const getRequesterTickets = async (requesterId) => {
  return await Ticket.findAll({
    where: { requesterId },
  });
};

export const updateTicket = async (id, data) => {
  const ticket = await Ticket.findByPk(id);

  if (!ticket) return null;

  return await ticket.update(data);
};

export const deleteTicket = async (id) => {
  const ticket = await Ticket.findByPk(id);

  if (!ticket) return null;

  await ticket.destroy();

  return true;
};