const express = require("express");
const { authenticateUser } = require("../middleware/auth.middleware");
const authorizeTeamMember = require("../middleware/authorizeTeamMember.middleware");

const router = express.Router();
const {
  sendInvitation,
  acceptInvitation,
  rejectInvitation,
  getInvitations,
} = require("../controller/invitations.controller");

router.use(authenticateUser);

router.post("/:teamId", authorizeTeamMember(["admin"]), sendInvitation);
router.post("/:invitationId/accept", acceptInvitation);
router.post("/:invitationId/reject", rejectInvitation);
router.get("/", getInvitations);

module.exports = router;
