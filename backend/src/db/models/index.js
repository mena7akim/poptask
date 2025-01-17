const User = require("./user");
const Team = require("./team");
const TeamMember = require("./teamMember");
const Project = require("./project");
const TaskStatus = require("./taskStatus");
const Task = require("./task");
const TaskDependency = require("./taskDependency");
const TaskAssignee = require("./taskAssignee");

// At this point, all associations are already defined within individual model files.
// This file primarily serves to bundle and export them.

module.exports = {
  User,
  Team,
  TeamMember,
  Project,
  TaskStatus,
  Task,
  TaskDependency,
  TaskAssignee,
};
