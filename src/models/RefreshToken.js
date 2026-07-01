  import { DataTypes } from "sequelize";
  import sequelize from "../config/database.js";
  import User from "./User.js";

  const RefreshToken = sequelize.define(
    "RefreshToken",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },

      tokenHash: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
      },

      expiresAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },

      revoked: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
    },
    {
      tableName: "refresh_tokens",
      timestamps: true,
    }
  );

  // Associations
  User.hasMany(RefreshToken, {
    foreignKey: "userId",
    onDelete: "CASCADE",
  });

  RefreshToken.belongsTo(User, {
    foreignKey: "userId",
  });

  export default RefreshToken;