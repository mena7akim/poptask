const { asyncHandler } = require("../utils/error/errorHandling");
const { successResponse } = require("../utils/response/successResponse");
const { sequelize } = require("../db/connection");
const { Team, TeamMember, User } = require("../models");

const createTeam = async (req, res, next) => {
  const teamData = req.body;
  const userId = req.user.id;
  const { name, icon, description } = teamData;

  // Start a transaction to ensure atomicity
  const transaction = await sequelize.transaction();

  try {
    // Create the new team
    const newTeam = await Team.create(
      {
        name,
        icon,
        description,
      },
      { transaction }
    );

    // Associate the creator as an admin member
    await TeamMember.create(
      {
        teamId: newTeam.id,
        userId,
        permissions: "admin", // Creator is an admin by default
      },
      { transaction }
    );

    // Commit the transaction
    await transaction.commit();

    // Retrieve the team with members
    const createdTeam = await Team.findOne({
      where: { id: newTeam.id },
      include: [
        {
          model: TeamMember,
          include: [User],
        },
      ],
    });

    return successResponse(res, {
      message: "Team have been created successfully.",
    });
  } catch (error) {
    // Rollback the transaction in case of error
    await transaction.rollback();
    next(error);
  }
};

const getTeamsForUser = asyncHandler(async (req, res, next) => {
  const userId = req.user.id;

  const teams = await Team.findAll({ userId });

  return successResponse(res, {
    data: teams,
  });
});

module.exports = {
  createTeam,
  getTeamsForUser,
};
