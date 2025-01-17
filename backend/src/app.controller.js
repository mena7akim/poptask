const models = require("./db/models");
const { connectDB, syncTables } = require("./db/connection.js");
const authRouter = require("./modules/auth/auth.controller.js");
const { globalErrorHandling } = require("./utils/error/errorHandling.js");
const seedTaskStatus = require("./db/seeders/taskStatusSeeder.js");
const apiBasePath = "/api/v1";

const bootstrap = (app, express) => {
  connectDB();

  // syncTables();

  seedTaskStatus();

  app.use(express.json());

  app.use(`${apiBasePath}/auth`, authRouter);

  app.use(globalErrorHandling);
};

module.exports = bootstrap;
