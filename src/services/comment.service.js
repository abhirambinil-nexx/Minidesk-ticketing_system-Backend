import * as repository from "../repositories/comment.repository.js";
import * as activityService from "./activity.service.js";

export const create = async (ticketId, body, user) => {
  const comment = await repository.createComment({
    ticketId,
    authorId: user.id,
    body,
  });

  await activityService.createActivity({
    ticketId,
    userId: user.id,
    action: "comment_added",
    field: "comment",
    newValue: body,
    user,
  });

  return comment;
};

export const getAll = async (ticketId) => {
  return await repository.getCommentsByTicket(ticketId);
};
