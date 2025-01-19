// src/models/TaskAssignee.js
const { DataTypes } = require("sequelize");
const { sequelize } = require("../db/connection");
const Task = require("./task");
const User = require("./user");

const TaskAssignee = sequelize.define(
  "TaskAssignee",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    taskId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Task,
        key: "id",
      },
      onDelete: "CASCADE",
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: "id",
      },
      onDelete: "CASCADE",
    },
    assignedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "TaskAssignees",
    timestamps: false,
    indexes: [
      {
        name: "idx_taskId",
        fields: ["taskId"],
      },
      {
        name: "idx_userId",
        fields: ["userId"],
      },
    ],
  }
);

Task.belongsToMany(User, {
  through: TaskAssignee,
  foreignKey: "taskId",
  otherKey: "userId",
  as: "Assignees",
});

User.belongsToMany(Task, {
  through: TaskAssignee,
  foreignKey: "userId",
  otherKey: "taskId",
  as: "AssignedTasks",
});

TaskAssignee.belongsTo(Task, { foreignKey: "taskId", onDelete: "CASCADE" });
TaskAssignee.belongsTo(User, { foreignKey: "userId", onDelete: "CASCADE" });

Task.hasMany(TaskAssignee, { foreignKey: "taskId" });
User.hasMany(TaskAssignee, { foreignKey: "userId" });

module.exports = TaskAssignee;
