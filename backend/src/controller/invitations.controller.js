const { User, Invitation, TeamMember, Team } = require("../models");
const sendEmail = require("../utils/email/sendEmail");
const { asyncHandler } = require("../utils/error/errorHandling");
const { successResponse } = require("../utils/response/successResponse");

// POST /api/v1/invitations | body {teamId, email}
// 	1. Check if user already in the team (don't send the invitation)
// 	2. Check if the inviter is an admin in the team
// 	3. Check if there is no other invitations for the same person from the same team
// 	4. Create invitation object
// 	5. Store it in the database
// 	6. Send email about the invitation

const sendInvitation = asyncHandler(async (req, res, next) => {
  const { teamId, email } = req.body;
  const inviterId = req.user.id;
  const team = await Team.findByPk(teamId);

  if (!team) {
    return next(new Error("This team is not exist."));
  }

  const { permissions: inviterPermission } = await TeamMember.findOne({
    where: { teamId, userId: inviterId },
    attributes: ["permissions"],
  });

  if (!inviterPermission || inviterPermission != "admin") {
    return next(
      new Error("You don't have the permission to add members to the team")
    );
  }

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

  await sendEmail(
    email,
    `${team.name} invites you to join their team`,
    invitationTemplate
  );

  return successResponse(res, {
    message: "User has been invited successfully",
  });
});

// POST /api/v1/invitations/{invitationId}/accept
// POST /api/v1/invitations/{invitationId}/reject
// 	1. Retrieve the invitations
// 	2. Check if this invitation is for this user
// 	3. Add the member to the team if the action = accept
// 	4. delete the invitation

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
    permissions: "viewer",
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

module.exports = {
  sendInvitation,
  acceptInvitation,
  rejectInvitation,
};
