import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";
import Ticket from "./Ticket.js";
import User from "./User.js";

const Comment = sequelize.define(
  "Comment",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    body: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  },
  {
    tableName: "comments",
    timestamps: true,
  },
);

Comment.belongsTo(Ticket, {
  foreignKey: "ticketId",
  as: "ticket",
});

Comment.belongsTo(User, {
  foreignKey: "authorId",
  as: "author",
});

Ticket.hasMany(Comment, {
  foreignKey: "ticketId",
  as: "comments",
});

User.hasMany(Comment, {
  foreignKey: "authorId",
  as: "comments",
});

export default Comment;
