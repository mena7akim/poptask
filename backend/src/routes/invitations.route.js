const express = require("express");
const authenticateBearerToken = require("../middleware/authMiddleware");
const router = express.Router();
const {
  sendInvitation,
  acceptInvitation,
  rejectInvitation,
} = require("../controller/invitations.controller");

router.use(authenticateBearerToken);
router.post("/", sendInvitation);
router.post("/:invitationId/accept", acceptInvitation);
router.post("/:invitationId/reject", rejectInvitation);

module.exports = router;
