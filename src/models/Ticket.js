import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";
import User from "./User.js";

const Ticket = sequelize.define(
  "Ticket",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    ticketKey: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM(
        "open",
        "in_progress",
        "resolved",
        "closed",
        "reopened",
      ),
      defaultValue: "open",
    },
    priority: {
      type: DataTypes.ENUM("low", "medium", "high", "urgent"),
      defaultValue: "medium",
    },
    category: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    requesterId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: "id",
      },
    },
    assigneeId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: User,
        key: "id",
      },
    },
    spaceId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "spaces",
        key: "id",
      },
    },
  },
  {
    tableName: "tickets",
    timestamps: true,
  },
);

export default Ticket;
