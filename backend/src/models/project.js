const { DataTypes } = require("sequelize");
const { sequelize } = require("../db/connection");
const Team = require("./team");

const Project = sequelize.define(
  "Project",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    deadline: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    deletedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "Projects",
    timestamps: true,
    paranoid: true,
  }
);

// Associations
Team.hasMany(Project, { foreignKey: "teamId", onDelete: "CASCADE" });
Project.belongsTo(Team, { foreignKey: "teamId" });

module.exports = Project;
