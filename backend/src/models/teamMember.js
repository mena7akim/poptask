const { DataTypes } = require("sequelize");
const { sequelize } = require("../db/connection");
const User = require("./user");
const Team = require("./team");

const TeamMember = sequelize.define(
  "TeamMember",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: "id",
      },
      validate: {
        notNull: {
          msg: "userId can't be null",
        },
      },
      onDelete: "CASCADE",
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
    permissions: {
      type: DataTypes.ENUM("admin", "editor", "viewer"),
      allowNull: false,
      validate: {
        notNull: {
          msg: "permissions can't be null",
        },
      },
      defaultValue: "viewer",
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "TeamMembers",
    timestamps: true,
  }
);

User.belongsToMany(Team, { through: TeamMember, foreignKey: "userId" });
Team.belongsToMany(User, { through: TeamMember, foreignKey: "teamId" });

TeamMember.belongsTo(User, { foreignKey: "userId", onDelete: "CASCADE" });
TeamMember.belongsTo(Team, { foreignKey: "teamId", onDelete: "CASCADE" });

User.hasMany(TeamMember, { foreignKey: "userId" });
Team.hasMany(TeamMember, { foreignKey: "teamId" });

module.exports = TeamMember;
