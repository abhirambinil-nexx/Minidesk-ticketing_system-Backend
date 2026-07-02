import Ticket from "../models/Ticket.js";
import { Op } from "sequelize";

export const createTicket = async (ticketData) => {
  return await Ticket.create(ticketData);
};

export const getAllTickets = async (filters = {}) => {
  const where = {};
  const include = [
    { association: "requester", attributes: ["id", "name"] }, // ← removed email
    { association: "assignee", attributes: ["id", "name"] }, // ← removed email
    { association: "tags" },
  ];

  if (filters.status) {
    where.status = filters.status.split(",");
  }
  if (filters.priority) {
    where.priority = filters.priority.split(","); // ← fixed typo
  }
  if (filters.assignee_id) {
    where.assignee_id = filters.assignee_id;
  }
  if (filters.requester_id) {
    where.requester_id = filters.requester_id;
  }

  if (filters.search) {
    where[Op.or] = [
      { title: { [Op.like]: `%${filters.search}%` } },
      { description: { [Op.like]: `%${filters.search}%` } },
    ];
  }

  const limit = parseInt(filters.limit) || 20;
  const offset = (parseInt(filters.page) || 1 - 1) * limit; // page 1 = offset 0
  const order = [];

  if (filters.sort) {
    const [field, direction] = filters.sort.split(":");
    order.push([field, direction || "DESC"]);
  } else {
    order.push(["createdAt", "DESC"]);
  }

  return await Ticket.findAll({
    where,
    include,
    limit,
    offset,
    order,
  });
};

export const getTicketById = async (id) => {
  return await Ticket.findByPk(id, {
    include: [
      { association: "requester", attributes: ["id", "name"] },
      { association: "assignee", attributes: ["id", "name"] },
      { association: "tags" },
    ],
  });
};

export const getRequesterTickets = async (requesterId) => {
  return await Ticket.findAll({
    where: { requesterId },
    include: [
      { association: "requester", attributes: ["id", "name"] },
      { association: "assignee", attributes: ["id", "name"] },
      { association: "tags" },
    ],
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
