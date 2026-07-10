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
import * as n8nService from "./n8n.service.js";
import * as statusHistoryService from "./statusHistory.service.js";
import * as activityService from "./activity.service.js";

import redisClient from "../config/redis.js";
import SpaceRepository from "../repositories/space.repository.js";
import SpaceMemberRepository from "../repositories/spaceMember.repository.js";
import UserRepository from "../repositories/user.repository.js";
import SpaceService from "./space.service.js";
import { invalidateDashboardCache } from "./dashboard.service.js";

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

const normalizeNullableDate = (value) => {
  if (value === "" || value === null || value === undefined) {
    return null;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
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
    startDate: normalizeNullableDate(data.startDate),
    dueDate: normalizeNullableDate(data.dueDate),
    requesterId: user.id,
    ticketKey,
  });
  await activityService.createActivity({
    ticketId: ticket.id,
    userId: user.id,
    action: "created",
    field: "ticket",
    message: `${ticket.title} was created`,
    title: ticket.title,
    user,
  });
  await n8nService.ticketCreated({
    ticketId: ticket.id,
    ticketKey: ticket.ticketKey,
    title: ticket.title,
    description: ticket.description,
    priority: ticket.priority,
    status: ticket.status,

    requester: user.name,
    requesterEmail: user.email,

    space: space.name,
  });
  await SpaceService.incrementTicketCount(space.id);

  await invalidateDashboardCache();
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
    const member = await SpaceMemberRepository.findByUser(
      ticket.spaceId,
      data.assigneeId,
    );

    if (!member) {
      throw new Error("Assigned user must be a member of this space.");
    }

    if (!["admin", "agent"].includes(member.role)) {
      throw new Error("Ticket can only be assigned to an admin or agent.");
    }
  }

  const changes = [];
  const normalizedData = {
    ...data,
    startDate:
      data.startDate !== undefined
        ? normalizeNullableDate(data.startDate)
        : data.startDate,
    dueDate:
      data.dueDate !== undefined
        ? normalizeNullableDate(data.dueDate)
        : data.dueDate,
  };

  if (data.description !== undefined && data.description !== ticket.description) {
    changes.push({
      action: "description_updated",
      field: "description",
      oldValue: ticket.description,
      newValue: data.description,
    });
  }

  if (data.title !== undefined && data.title !== ticket.title) {
    changes.push({
      action: "title_changed",
      field: "title",
      oldValue: ticket.title,
      newValue: data.title,
    });
  }

  if (data.priority !== undefined && data.priority !== ticket.priority) {
    changes.push({
      action: "priority_changed",
      field: "priority",
      oldValue: ticket.priority,
      newValue: data.priority,
    });
  }

  if (data.category !== undefined && data.category !== ticket.category) {
    changes.push({
      action: "category_changed",
      field: "category",
      oldValue: ticket.category,
      newValue: data.category,
    });
  }

  if (data.assigneeId !== undefined) {
    const oldAssignee = ticket.assignee?.name || null;
    const nextAssignee = data.assigneeId
      ? await UserRepository.findById(data.assigneeId)
      : null;
    const newAssignee = nextAssignee?.name || null;
    if (String(data.assigneeId || "") !== String(ticket.assigneeId || "")) {
      changes.push({
        action: "assigned",
        field: "assigneeId",
        oldValue: oldAssignee,
        newValue: newAssignee,
      });
    }
  }

  if (data.startDate !== undefined) {
    const nextStart = normalizedData.startDate;
    if (String(nextStart || "") !== String(ticket.startDate || "")) {
      changes.push({
        action: "start_date_changed",
        field: "startDate",
        oldValue: ticket.startDate,
        newValue: nextStart,
      });
    }
  }

  if (data.dueDate !== undefined) {
    const nextDue = normalizedData.dueDate;
    if (String(nextDue || "") !== String(ticket.dueDate || "")) {
      changes.push({
        action: "due_date_changed",
        field: "dueDate",
        oldValue: ticket.dueDate,
        newValue: nextDue,
      });
    }
  }

  const oldStatus = ticket.status;

  const updatedTicket = await updateTicket(id, normalizedData);

  if (data.status && oldStatus !== data.status) {
    await statusHistoryService.create(ticket.id, oldStatus, data.status, user);
    await activityService.createActivity({
      ticketId: ticket.id,
      userId: user.id,
      action:
        data.status === "closed"
          ? "ticket_closed"
          : data.status === "resolved"
            ? "ticket_resolved"
          : data.status === "reopened"
            ? "ticket_reopened"
            : "status_changed",
      field: "status",
      oldValue: oldStatus,
      newValue: data.status,
      user,
    });
  }

  for (const change of changes) {
    await activityService.createActivity({
      ticketId: ticket.id,
      userId: user.id,
      user,
      ...change,
    });
  }

  await invalidateDashboardCache();
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

  if (ticket.spaceId) {
    await SpaceService.decrementTicketCount(ticket.spaceId);
  }

  await invalidateDashboardCache();
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
