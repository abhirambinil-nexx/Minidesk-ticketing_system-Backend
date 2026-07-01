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
    },

    assigneeId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    tableName: "tickets",
    timestamps: true,
  },
);

export default Ticket;
