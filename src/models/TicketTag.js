import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const TicketTag = sequelize.define(
  "TicketTag",
  {
    ticketId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
    },
    tagId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
    },
  },
  {
    tableName: "ticket_tags",
    timestamps: false,
  }
);

export default TicketTag;