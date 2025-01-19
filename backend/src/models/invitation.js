const { DataTypes } = require("sequelize");
const { sequelize } = require("../db/connection");
const Team = require("./team");

const Invitation = sequelize.define(
  "Invitation",
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
    inviteeEmail: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        isEmail: {
          msg: "please enter a valid email",
        },
        notNull: {
          msg: "inviteeEmail can't be null",
        },
      },
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    tableName: "Invitations",
    timestamps: true,
    paranoid: false,
  }
);

Team.hasMany(Invitation, {
  foreignKey: "teamId",
  as: "invitations",
  onDelete: "CASCADE",
});
Invitation.belongsTo(Team, { foreignKey: "teamId" });

module.exports = Invitation;
