import * as repository from "../repositories/comment.repository.js";

export const create = async (ticketId, body, user) => {
  return await repository.createComment({
    ticketId,
    authorId: user.id,
    body,
  });
};

export const getAll = async (ticketId) => {
  return await repository.getCommentsByTicket(ticketId);
};