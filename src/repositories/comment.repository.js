import Comment from "../models/Comment.js";
import User from "../models/User.js";

export const createComment = async (data) => {
  return await Comment.create(data);
};

export const getCommentsByTicket = async (ticketId) => {
  return await Comment.findAll({
    where: { ticketId },
    include: [
      {
        model: User,
        as: "author",
        attributes: ["id", "name", "role"],
      },
    ],
    order: [["createdAt", "ASC"]],
  });
};