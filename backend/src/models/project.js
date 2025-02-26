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
    teamId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Team,
        key: "id",
      },
      validate: {
        notNull: {
          msg: "teamId can't be null",
        },
      },
      onDelete: "CASCADE",
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notNull: {
          msg: "name can't be null",
        },
      },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notNull: {
          msg: "description can't be null",
        },
      },
    },
    deadline: {
      type: DataTypes.DATE,
      allowNull: false,
      validate: {
        notNull: {
          msg: "Deadline can't be null",
        },
        isDate: {
          msg: "Deadline must be a valid date",
        },
        isAfter: {
          args: new Date().toISOString(), // Ensure deadline is in the future
          msg: "Deadline must be a future date",
        },
      },
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
