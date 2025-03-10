const { Sequelize } = require("sequelize");
const dbConfig = require("../config/db.config")["development"];
const { username, password, database, host, port, dialect } = dbConfig;
const sequelize = new Sequelize(database, username, password, {
  host: host,
  port: port,
  dialect: dialect,
});

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log("Connection has been established successfully.");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
};

const syncTables = async () => {
  try {
    await sequelize.sync();
    console.log("All models were synchronized successfully.");
  } catch (error) {
    console.error("Error while syncing tables: ", error);
  }
};

module.exports = { sequelize, connectDB, syncTables };
