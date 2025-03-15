const User = require("./user");
const Team = require("./team");
const TeamMember = require("./teamMember");
const Project = require("./project");
const Task = require("./task");
const TaskDependency = require("./taskDependency");
const TaskAssignee = require("./taskAssignee");
const Invitation = require("./invitation");
// At this point, all associations are already defined within individual model files.
// This file primarily serves to bundle and export them.

module.exports = {
  User,
  Team,
  TeamMember,
  Project,
  Task,
  TaskDependency,
  TaskAssignee,
  Invitation,
};
