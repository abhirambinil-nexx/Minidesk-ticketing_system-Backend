import Ticket from "../models/Ticket.js";
import { Op } from "sequelize";

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
