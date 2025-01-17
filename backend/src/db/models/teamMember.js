const { DataTypes } = require("sequelize");
const { sequelize } = require("../connection");
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
    permissions: {
      type: DataTypes.ENUM("admin", "editor", "viewer"),
      allowNull: false,
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

// Associations
User.belongsToMany(Team, { through: TeamMember, foreignKey: "userId" });
Team.belongsToMany(User, { through: TeamMember, foreignKey: "teamId" });

TeamMember.belongsTo(User, { foreignKey: "userId", onDelete: "CASCADE" });
TeamMember.belongsTo(Team, { foreignKey: "teamId", onDelete: "CASCADE" });

User.hasMany(TeamMember, { foreignKey: "userId" });
Team.hasMany(TeamMember, { foreignKey: "teamId" });

module.exports = TeamMember;
