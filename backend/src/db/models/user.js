const { DataTypes } = require("sequelize");
const { sequelize } = require("../connection");
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
      allowNull: false,
      validate: {
        notNull: true,
      }, 
    },
    firstName: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    lastName: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    profileImage: {
      type: DataTypes.STRING(255),
      allowNull: true,
      validate: {
        isUrl: true,
      },
    },
    emailConfirmed: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    emailConfirmationToken: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    resetPasswordToken: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    resetPasswordExpires: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    deletedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "Users",
    timestamps: true, // Adds createdAt and updatedAt
    paranoid: true, // Enables soft deletes (deletedAt)
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
  }
);

module.exports = User;
