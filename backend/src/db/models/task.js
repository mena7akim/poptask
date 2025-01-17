const { DataTypes } = require("sequelize");
const { sequelize } = require("../connection");
const Project = require("./project");
const TaskStatus = require("./taskStatus");

const Task = sequelize.define(
  "Task",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    projectId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Project,
        key: "id",
      },
      onDelete: "CASCADE",
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    statusId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: TaskStatus,
        key: "id",
      },
    },
    priority: {
      type: DataTypes.ENUM("Low", "Medium", "High"),
      allowNull: false,
      defaultValue: "Medium",
    },
    deletedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "Tasks",
    timestamps: true,
    paranoid: true,
    indexes: [
      {
        name: "idx_projectId",
        fields: ["projectId"],
      },
      {
        name: "idx_statusId",
        fields: ["statusId"],
      },
    ],
  }
);

// Associations
Project.hasMany(Task, { foreignKey: "projectId", onDelete: "CASCADE" });
Task.belongsTo(Project, { foreignKey: "projectId" });

TaskStatus.hasMany(Task, { foreignKey: "statusId" });
Task.belongsTo(TaskStatus, { foreignKey: "statusId" });

module.exports = Task;
