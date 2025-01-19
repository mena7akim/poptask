const { DataTypes } = require("sequelize");
const { sequelize } = require("../db/connection");

const TaskStatus = sequelize.define(
  "TaskStatus",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    statusName: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
  },
  {
    tableName: "TaskStatus",
    timestamps: false, // No createdAt or updatedAt
  }
);

module.exports = TaskStatus;
