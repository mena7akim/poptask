const swaggerUi = require("swagger-ui-express");
const fs = require("fs");
const { connectDB, syncTables } = require("./db/connection.js");
const authRouter = require("./routes/auth.route.js");
const teamsRouter = require("./routes/teams.route.js");
const invitationsRouter = require("./routes/invitations.route.js");
const tasksRouter = require("./routes/tasks.route.js");
const projectsRouter = require("./routes/projects.route.js");
const usersRouter = require("./routes/users.route.js");

const { globalErrorHandling } = require("./utils/error/errorHandling.js");
const seedTaskStatus = require("./db/seeders/taskStatusSeeder.js");
const apiBasePath = "/api/v1";
const redisClient = require("./db/redis/redisClient.js");
const morgan = require("morgan");

const bootstrap = async (app, express) => {
  connectDB();

  await redisClient.connect();

  await syncTables();

  await seedTaskStatus();

  app.use(morgan("dev"));

  app.use(express.json());

  app.use(`${apiBasePath}/auth`, authRouter);
  app.use(`${apiBasePath}/teams`, teamsRouter);
  app.use(`${apiBasePath}/invitations`, invitationsRouter);
  app.use(`${apiBasePath}/tasks/:projectId`, tasksRouter);
  app.use(`${apiBasePath}/projects/:teamId`, projectsRouter);
  app.use(`${apiBasePath}/users`, usersRouter);

  app.use(globalErrorHandling);

  const filePath = `${__dirname}/docs/index.json`;
  const swaggerData = fs.readFileSync(filePath, "utf8");
  const swaggerJSON = JSON.parse(swaggerData);

  app.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(swaggerJSON, { explorer: true })
  );
};

module.exports = bootstrap;
