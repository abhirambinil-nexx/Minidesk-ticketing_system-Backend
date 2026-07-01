import StatusHistory from "../models/StatusHistory.js";
import User from "../models/User.js";

export const createHistory = async (data) => {
  return await StatusHistory.create(data);
};

export const getHistory = async (ticketId) => {
  return await StatusHistory.findAll({
    where: {
      ticketId,
    },
    include: [
      {
        model: User,
        as: "user",
        attributes: ["id", "name"],
      },
    ],
    order: [["createdAt", "ASC"]],
  });
};
