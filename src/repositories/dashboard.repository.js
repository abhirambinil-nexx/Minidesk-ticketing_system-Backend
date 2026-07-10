import Ticket from "../models/Ticket.js";
import Space from "../models/Space.js";
import { Op, literal } from "sequelize";

export const getDashboardStats = async () => {
  const total = await Ticket.count();
  console.log("Total Tickets:", total);

  const open = await Ticket.count({
    where: {
      status: "open",
    },
  });
  console.log("Open Tickets:", open);

  const inProgress = await Ticket.count({
    where: {
      status: "in_progress",
    },
  });

  const resolved = await Ticket.count({
    where: {
      status: "resolved",
    },
  });

  const closed = await Ticket.count({
    where: {
      status: "closed",
    },
  });

  const urgent = await Ticket.count({
    where: {
      priority: "urgent",
    },
  });

  const recentTickets = await Ticket.findAll({
    limit: 5,
    order: [["createdAt", "DESC"]],
  });

  return {
    total,
    open,
    inProgress,
    resolved,
    closed,
    urgent,
    recentTickets,
  };
};

export const getAssignedTickets = async (userId) => {
  return await Ticket.findAll({
    where: {
      assigneeId: userId,
    },
    attributes: ["id", "ticketKey", "title", "priority", "status", "dueDate"],
    include: [
      {
        model: Space,
        as: "space",
        attributes: ["name", "key"],
      },
    ],
    order: [
      ["dueDate", "ASC"],
      [
        literal(`CASE priority
          WHEN 'urgent' THEN 1
          WHEN 'high' THEN 2
          WHEN 'medium' THEN 3
          WHEN 'low' THEN 4
          ELSE 5
        END`),
        "ASC",
      ],
      ["updatedAt", "DESC"],
    ],
  });
};
