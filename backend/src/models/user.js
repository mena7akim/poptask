const { DataTypes } = require("sequelize");
const { sequelize } = require("../db/connection");
const bcrypt = require("bcrypt");

const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
        notNull: true,
      },
    },
    password: {
      type: DataTypes.STRING(255),
    },
    firstName: {
      type: DataTypes.STRING(255),
    },
    lastName: {
      type: DataTypes.STRING(255),
    },
    profileImage: {
      type: DataTypes.STRING(255),
      validate: {
        isUrl: true,
      },
    },
    deletedAt: {
      type: DataTypes.DATE,
    },
  },
  {
    tableName: "Users",
    timestamps: true,
    paranoid: true,
    hooks: {
      beforeCreate: async (user, options) => {
        if (user.password) {
          const saltRounds = 8;
          user.password = await bcrypt.hash(user.password, saltRounds);
        }
      },
      beforeUpdate: async (user, options) => {
        if (user.changed("password")) {
          const saltRounds = 8;
          user.password = await bcrypt.hash(user.password, saltRounds);
        }
      },
    },
    defaultScope: {
      attributes: {
        exclude: ["password", "deletedAt"],
      },
    },
    scopes: {
      withPassword: {
        exclude: ["deletedAt"],
      },
    },
  }
);

module.exports = User;
