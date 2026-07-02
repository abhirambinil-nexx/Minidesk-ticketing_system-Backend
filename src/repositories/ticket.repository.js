import Ticket from "../models/Ticket.js";
import { Op } from "sequelize";

export const createTicket = async (ticketData) => {
  return await Ticket.create(ticketData);
};

export const getAllTickets = async (filters = {}) => {
  const where = {};

  const include = [
    {
      association: "requester",
      attributes: ["id", "name"],
    },
    {
      association: "assignee",
      attributes: ["id", "name"],
    },
    {
      association: "tags",
    },
  ];

  // Status Filter
  if (filters.status) {
    where.status = {
      [Op.in]: filters.status.split(","),
    };
  }

  // Priority Filter
  if (filters.priority) {
    where.priority = {
      [Op.in]: filters.priority.split(","),
    };
  }

  // Category Filter
  if (filters.category) {
    where.category = filters.category;
  }

  // Assignee Filter
  if (filters.assigneeId) {
    where.assigneeId = filters.assigneeId;
  }

  // Requester Filter
  if (filters.requesterId) {
    where.requesterId = filters.requesterId;
  }

  // Search
  if (filters.search) {
    where[Op.or] = [
      {
        title: {
          [Op.like]: `%${filters.search}%`,
        },
      },
      {
        description: {
          [Op.like]: `%${filters.search}%`,
        },
      },
    ];
  }

  // Tag Filter
  if (filters.tag) {
    include[2] = {
      association: "tags",
      where: {
        name: filters.tag,
      },
      required: true,
    };
  }

  // Pagination
  const page = parseInt(filters.page) || 1;
  const limit = parseInt(filters.limit) || 20;
  const offset = (page - 1) * limit;

  // Sorting
  const allowedFields = [
    "createdAt",
    "updatedAt",
    "priority",
    "status",
    "title",
  ];

  let sortField = "createdAt";
  let sortOrder = "DESC";

  if (filters.sort) {
    const [field, order] = filters.sort.split(":");

    if (allowedFields.includes(field)) {
      sortField = field;
    }

    if (["ASC", "DESC"].includes((order || "").toUpperCase())) {
      sortOrder = order.toUpperCase();
    }
  }

  const result = await Ticket.findAndCountAll({
    where,
    include,
    distinct: true,
    limit,
    offset,
    order: [[sortField, sortOrder]],
  });

  return {
    data: result.rows,
    pagination: {
      total: result.count,
      page,
      limit,
      totalPages: Math.ceil(result.count / limit),
    },
  };
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
