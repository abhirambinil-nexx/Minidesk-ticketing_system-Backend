import User from "./User.js";
import Ticket from "./Ticket.js";
import Tag from "./Tag.js";
import TicketTag from "./TicketTag.js";
import Space from "./Space.js";
import SpaceMember from "./SpaceMember.js";
import SpaceInvitation from "./SpaceInvitation.js";
import Activity from "./Activity.js";
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

// Space ↔ Members

Space.hasMany(SpaceMember, {
  foreignKey: "spaceId",
  as: "members",
});

SpaceMember.belongsTo(Space, {
  foreignKey: "spaceId",
  as: "space",
});

// Space ↔ Invitations
Space.hasMany(SpaceInvitation, {
  foreignKey: "spaceId",
  as: "invitations",
});

SpaceInvitation.belongsTo(Space, {
  foreignKey: "spaceId",
  as: "space",
});

// User ↔ Members

User.hasMany(SpaceMember, {
  foreignKey: "userId",
  as: "spaces",
});

SpaceMember.belongsTo(User, {
  foreignKey: "userId",
  as: "user",
});

// Invitation ↔ User (creator)
User.hasMany(SpaceInvitation, {
  foreignKey: "createdBy",
  as: "sentInvitations",
});

SpaceInvitation.belongsTo(User, {
  foreignKey: "createdBy",
  as: "creator",
});

// ================================
// Ticket ↔ Activity
// ================================

Ticket.hasMany(Activity, {
  foreignKey: "ticketId",
  as: "activities",
});

Activity.belongsTo(Ticket, {
  foreignKey: "ticketId",
  as: "ticket",
});

User.hasMany(Activity, {
  foreignKey: "userId",
  as: "activities",
});

Activity.belongsTo(User, {
  foreignKey: "userId",
  as: "user",
});

export {
  User,
  Ticket,
  Tag,
  TicketTag,
  Space,
  SpaceMember,
  SpaceInvitation,
  Activity,
};
