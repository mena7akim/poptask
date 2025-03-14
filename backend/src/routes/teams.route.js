const express = require("express");
const router = express.Router();
const { authenticateUser } = require("../middleware/auth.middleware");
const {
  createTeam,
  getTeamsForUser,
} = require("../controller/teams.controller");

router.use(authenticateUser);
router.post("/", createTeam);
router.get("/", getTeamsForUser);

module.exports = router;
