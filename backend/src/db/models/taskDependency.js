const { DataTypes } = require("sequelize");
const { sequelize } = require("../connection");
const Task = require("./task");

const TaskDependency = sequelize.define(
  "TaskDependency",
  {
    dependentTaskId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      references: {
        model: Task,
        key: "id",
      },
      onDelete: "CASCADE",
    },
    dependencyTaskId: {
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
Task.belongsToMany(Task, {
  through: TaskDependency,
  as: "Dependencies",
  foreignKey: "dependentTaskId",
  otherKey: "dependencyTaskId",
});

Task.belongsToMany(Task, {
  through: TaskDependency,
  as: "Dependents",
  foreignKey: "dependencyTaskId",
  otherKey: "dependentTaskId",
});

module.exports = TaskDependency;
