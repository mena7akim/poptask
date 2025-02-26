const { TeamMember, Project } = require("../models");
const {
  asyncHandler,
  unauthorizedError,
} = require("../utils/error/errorHandling");
const { Op } = require("sequelize");

const authorizeTeamMember = (requiredRoles) => {
  return asyncHandler(async (req, res, next) => {
    const user = req.user;
    if (req.params.projectId) {
      req.params.teamId = await getTeamId(req.params.projectId);
    }
    const teamId = req.params.teamId;
    if (!teamId) {
      return next(unauthorizedError());
    }

    // Check if the user is a team member with the required roles
    const isTeamMember = await TeamMember.findOne({
      where: {
        userId: user.id,
        teamId,
        permissions: {
          [Op.in]: requiredRoles,
        },
      },
    });

    if (!isTeamMember) {
      return next(unauthorizedError());
    }
    next();
  });
};

const getTeamId = async (projectId) => {
  const project = await Project.findOne({
    where: { id: projectId },
    attributes: ["teamId"],
  });
  return project.teamId;
};

module.exports = authorizeTeamMember;
