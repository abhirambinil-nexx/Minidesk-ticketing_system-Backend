import User from "./User.js";
import Ticket from "./Ticket.js";
import Tag from "./Tag.js";
import TicketTag from "./TicketTag.js";
import Space from "./Space.js";

// ================================
// User ↔ Ticket
// ================================

User.hasMany(Ticket, {
  foreignKey: "requesterId",
  as: "ticketsAsRequester",
});

User.hasMany(Ticket, {
  foreignKey: "assigneeId",
  as: "ticketsAsAssignee",
});

Ticket.belongsTo(User, {
  foreignKey: "requesterId",
  as: "requester",
});

Ticket.belongsTo(User, {
  foreignKey: "assigneeId",
  as: "assignee",
});

// ================================
// User ↔ Space
// ================================

User.hasMany(Space, {
  foreignKey: "ownerId",
  as: "ownedSpaces",
});

Space.belongsTo(User, {
  foreignKey: "ownerId",
  as: "owner",
});

// ================================
// Ticket ↔ Tag
// ================================

Ticket.belongsToMany(Tag, {
  through: TicketTag,
  foreignKey: "ticketId",
  otherKey: "tagId",
  as: "tags",
});

Tag.belongsToMany(Ticket, {
  through: TicketTag,
  foreignKey: "tagId",
  otherKey: "ticketId",
  as: "tickets",
});

// ================================
// Space ↔ Ticket
// ================================

Space.hasMany(Ticket, {
  foreignKey: "spaceId",
  as: "tickets",
});

Ticket.belongsTo(Space, {
  foreignKey: "spaceId",
  as: "space",
});

export { User, Ticket, Tag, TicketTag, Space };
