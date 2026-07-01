import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";
import Ticket from "./Ticket.js";
import User from "./User.js";

const StatusHistory = sequelize.define(
  "StatusHistory",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    fromStatus: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    toStatus: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    tableName: "ticket_status_history",
    timestamps: true,
  },
);

StatusHistory.belongsTo(Ticket, {
  foreignKey: "ticketId",
  as: "ticket",
});

StatusHistory.belongsTo(User, {
  foreignKey: "changedBy",
  as: "user",
});

Ticket.hasMany(StatusHistory, {
  foreignKey: "ticketId",
  as: "history",
});

export default StatusHistory;
