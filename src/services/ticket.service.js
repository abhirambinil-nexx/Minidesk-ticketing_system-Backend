import {
  createTicket,
  getAllTickets,
  getRequesterTickets,
  getTicketById,
  updateTicket,
  deleteTicket,
} from "../repositories/ticket.repository.js";
import * as statusHistoryService from "./statusHistory.service.js";
import redisClient from "../config/redis.js";
import userRepository from "../repositories/user.repository.js";

export const create = async (data, user) => {
  const ticket = await createTicket({
    ...data,
    requesterId: user.id,
  });

  // Clear Redis caches
  await redisClient.del("dashboard:stats");
  await redisClient.del("tickets:all");
  await redisClient.del(`tickets:requester:${user.id}`);

  console.log("🗑️ Dashboard & Ticket cache cleared");

  return ticket;
};

export const getAll = async (user, filters = {}) => {
  const cacheKey =
    user.role === "requester"
      ? `tickets:requester:${user.id}:${JSON.stringify(filters)}`
      : `tickets:all:${JSON.stringify(filters)}`;

  // Check Redis first
  const cachedTickets = await redisClient.get(cacheKey);

  if (cachedTickets) {
    console.log("⚡ Tickets served from Redis");
    return JSON.parse(cachedTickets);
  }

  let result;

  if (user.role === "requester") {
    result = await getRequesterTickets(user.id, filters);
  } else {
    result = await getAllTickets(filters);
  }

  // Cache for 60 seconds
  await redisClient.setEx(cacheKey, 60, JSON.stringify(result));

  console.log("💾 Tickets cached in Redis");

  return result;
};

export const getOne = async (id) => {
  return await getTicketById(id);
};

export const update = async (id, data, user) => {
  const ticket = await getTicketById(id);

  if (!ticket) {
    throw new Error("Ticket not found");
  }

  // Validate assignee
  if (data.assigneeId) {
    const agent = await userRepository.findById(data.assigneeId);

    if (!agent) {
      throw new Error("Assigned user not found.");
    }

    if (!["admin", "agent"].includes(agent.role)) {
      throw new Error("Ticket can only be assigned to an admin or agent.");
    }
  }

  const oldStatus = ticket.status;

  const updatedTicket = await updateTicket(id, data);

  if (data.status && oldStatus !== data.status) {
    await statusHistoryService.create(ticket.id, oldStatus, data.status, user);
  }

  // Clear Redis caches
  await redisClient.del("dashboard:stats");
  await redisClient.del("tickets:all");
  await redisClient.del(`tickets:requester:${ticket.requesterId}`);

  console.log("🗑️ Dashboard & Ticket cache cleared");

  return updatedTicket;
};

export const remove = async (id) => {
  const ticket = await getTicketById(id);

  if (!ticket) {
    throw new Error("Ticket not found");
  }

  await deleteTicket(id);

  // Clear Redis caches
  await redisClient.del("dashboard:stats");
  await redisClient.del("tickets:all");
  await redisClient.del(`tickets:requester:${ticket.requesterId}`);

  console.log(" Dashboard & Ticket cache cleared");

  return true;
};
