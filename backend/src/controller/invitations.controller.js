const { User, Invitation, TeamMember, Team } = require("../models");
const sendEmail = require("../utils/email/sendEmail");
const { asyncHandler } = require("../utils/error/errorHandling");
const { successResponse } = require("../utils/response/successResponse");
const { Op } = require("sequelize");

const sendInvitation = asyncHandler(async (req, res, next) => {
  const { teamId, email } = req.body;

  const invitee = await User.findOne({ where: { email } });
  if (!invitee) {
    return next(new Error("This user is not exist."));
  }

  const isInviteeMember = await TeamMember.findOne({
    where: { teamId, userId: invitee.id },
  });

  if (isInviteeMember) {
    return next(new Error("This user is alreay on the team"));
  }

  const isInvitationExist = await Invitation.findOne({
    teamId,
    inviteeEmail: invitee.email,
  });

  if (isInvitationExist) {
    return next(new Error("This user is alreay invited"));
  }
  const invitation = await Invitation.create({
    teamId,
    inviteeEmail: email,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });

  // will be modified
  const invitationTemplate = `
    <h1>hello,</h1>
    <h2>join our team</h2>
  `;

  const team = await Team.findOne({ where: { id: teamId } });

  await sendEmail(
    email,
    `${team.name} invites you to join their team`,
    invitationTemplate
  );

  return successResponse(res, {
    message: "User has been invited successfully",
  });
});

const acceptInvitation = asyncHandler(async (req, res, next) => {
  const { invitationId } = req.params;
  const user = req.user;
  const invitation = await Invitation.findByPk(invitationId);

  if (!invitation) {
    next(new Error("Invitation is expired or not exist"));
  }

  if (invitation.inviteeEmail != user.email) {
    next(new Error("You can't accept or reject this invitation"));
  }

  const teamMember = await TeamMember.create({
    teamId: invitation.teamId,
    userId: user.id,
    permissions: "tasker",
  });

  await Invitation.destroy({
    where: {
      id: invitationId,
    },
  });

  return successResponse(res, {
    message: "You have joined the team successfully",
  });
});

const rejectInvitation = asyncHandler(async (req, res, next) => {
  const { invitationId } = req.params;
  const user = req.user;
  const invitation = await Invitation.findByPk(invitationId);

  if (!invitation) {
    next(new Error("Invitation is expired or not exist"));
  }

  if (invitation.inviteeEmail != user.email) {
    next(new Error("You can't accept or reject this invitation"));
  }

  await Invitation.destroy({
    where: {
      id: invitationId,
    },
  });

  return successResponse(res, {
    message: "You have rejected the invitation successfully",
  });
});

const getInvitations = asyncHandler(async (req, res, next) => {
  const user = req.user;

  const invitations = await Invitation.findAll({
    where: {
      inviteeEmail: user.email,
      expiresAt: {
        [Op.gt]: new Date(),
      },
    },
    include: [
      {
        model: Team,
      },
    ],
  });

  return successResponse(res, {
    message: "Here are your invitations.",
    data: invitations,
  });
});

module.exports = {
  sendInvitation,
  acceptInvitation,
  rejectInvitation,
  getInvitations,
};
