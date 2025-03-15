const { DataTypes } = require("sequelize");
const { sequelize } = require("../db/connection");
const Task = require("./task");

const TaskDependency = sequelize.define(
  "TaskDependency",
  {
    from: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      references: {
        model: Task,
        key: "id",
      },
      onDelete: "CASCADE",
    },
    to: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      references: {
        model: Task,
        key: "id",
      },
      onDelete: "CASCADE",
    },
  },
  {
    tableName: "TaskDependencies",
    timestamps: false,
  }
);

// Self-referential Associations
Task.hasMany(TaskDependency, {
  foreignKey: "from",
  as: "fromTask",
});

Task.hasMany(TaskDependency, {
  foreignKey: "to",
  as: "toTask",
});

module.exports = TaskDependency;
