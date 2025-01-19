const models = require("./models");
const { connectDB, syncTables } = require("./db/connection.js");
const authRouter = require("./routes/auth.route.js");
const teamsRouter = require("./routes/teams.route.js");
const invitationsRouter = require("./routes/invitations.route.js");

const { globalErrorHandling } = require("./utils/error/errorHandling.js");
const seedTaskStatus = require("./db/seeders/taskStatusSeeder.js");
const apiBasePath = "/api/v1";

const bootstrap = (app, express) => {
  connectDB();

  // syncTables();

  // seedTaskStatus();

  app.use(express.json());

  app.use(`${apiBasePath}/auth`, authRouter);
  app.use(`${apiBasePath}/teams`, teamsRouter);
  app.use(`${apiBasePath}/invitations`, invitationsRouter);
  app.use(globalErrorHandling);
};

module.exports = bootstrap;
