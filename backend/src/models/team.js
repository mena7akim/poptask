const { DataTypes } = require("sequelize");
const { sequelize } = require("../db/connection");

const Team = sequelize.define(
  "Team",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
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
    icon: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        isUrl: true,
        notNull: {
          msg: "icon can't be null",
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
    deletedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "Teams",
    timestamps: true,
    paranoid: true,
    defaultScope: {
      attributes: {
        exclude: ["deletedAt", "createdAt", "updatedAt"],
      },
    },
    scopes: {
      withTimeStamps: {
        attributes: {},
      },
    },
  }
);

module.exports = Team;
