import {
  createTicket,
  getAllTickets,
  getRequesterTickets,
  getTicketById,
  updateTicket,
  deleteTicket,
  getTicketsBySpace,
  countBySpace,
} from "../repositories/ticket.repository.js";

import * as statusHistoryService from "./statusHistory.service.js";

import redisClient from "../config/redis.js";
import userRepository from "../repositories/user.repository.js";
import SpaceRepository from "../repositories/space.repository.js";

// =============================================
// Clear Space Ticket Cache
// =============================================

const clearSpaceTicketCache = async (spaceId) => {
  if (!spaceId) return;

  const keys = await redisClient.keys(`tickets:space:${spaceId}:*`);

  if (keys.length > 0) {
    await redisClient.del(keys);
  }
};

// =============================================
// Create Ticket
// =============================================

export const create = async (data, user) => {
  const space = await SpaceRepository.findById(data.spaceId);

  if (!space) {
    throw new Error("Space not found.");
  }

  const count = await countBySpace(space.id);

  const ticketKey = `${space.key}-${count + 1}`;

  const ticket = await createTicket({
    ...data,
    requesterId: user.id,
    ticketKey,
  });                                                       
  await redisClient.del("dashboard:stats");
  await redisClient.del("tickets:all");
  await redisClient.del(`tickets:requester:${user.id}`);

  await clearSpaceTicketCache(ticket.spaceId);

  console.log("🗑️ Dashboard & Ticket cache cleared");

  return ticket;
};

// =============================================
// Get All Tickets
// =============================================

export const getAll = async (user, filters = {}) => {
  const cacheKey =
    user.role === "requester"
      ? `tickets:requester:${user.id}:${JSON.stringify(filters)}`
      : `tickets:all:${JSON.stringify(filters)}`;

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

  await redisClient.setEx(cacheKey, 60, JSON.stringify(result));

  console.log("💾 Tickets cached in Redis");

  return result;
};

// =============================================
// Get Ticket
// =============================================

export const getOne = async (id) => {
  return await getTicketById(id);
};

// =============================================
// Update Ticket
// =============================================

export const update = async (id, data, user) => {
  const ticket = await getTicketById(id);

  if (!ticket) {
    throw new Error("Ticket not found");
  }

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

  await redisClient.del("dashboard:stats");
  await redisClient.del("tickets:all");
  await redisClient.del(`tickets:requester:${ticket.requesterId}`);

  await clearSpaceTicketCache(ticket.spaceId);

  console.log("🗑️ Dashboard & Ticket cache cleared");

  return updatedTicket;
};

// =============================================
// Delete Ticket
// =============================================

export const remove = async (id) => {
  const ticket = await getTicketById(id);

  if (!ticket) {
    throw new Error("Ticket not found");
  }

  await deleteTicket(id);

  await redisClient.del("dashboard:stats");
  await redisClient.del("tickets:all");
  await redisClient.del(`tickets:requester:${ticket.requesterId}`);

  await clearSpaceTicketCache(ticket.spaceId);

  console.log("🗑️ Dashboard & Ticket cache cleared");

  return true;
};

// =============================================
// Get Tickets By Space
// =============================================

export const getBySpace = async (spaceKey, filters = {}) => {
  const space = await SpaceRepository.findByKey(spaceKey);

  if (!space) {
    throw new Error("Space not found.");
  }

  const cacheKey = `tickets:space:${space.id}:${JSON.stringify(filters)}`;

  const cachedTickets = await redisClient.get(cacheKey);

  if (cachedTickets) {
    console.log("⚡ Space tickets served from Redis");
    return JSON.parse(cachedTickets);
  }

  const result = await getTicketsBySpace(space.id, filters);

  await redisClient.setEx(cacheKey, 60, JSON.stringify(result));

  console.log("💾 Space tickets cached in Redis");

  return result;
};
