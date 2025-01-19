const express = require("express");
const authenticateBearerToken = require("../middleware/authMiddleware");
const router = express.Router();
const {
  createTeam,
  getTeamsForUser,
} = require("../controller/teams.controller");

router.use(authenticateBearerToken);
router.route("/").get(getTeamsForUser).post(createTeam);

module.exports = router;
