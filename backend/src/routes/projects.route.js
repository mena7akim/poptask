const express = require("express");
const { authenticateUser } = require("../middleware/auth.middleware");
const authorizeTeamMember = require("../middleware/authorizeTeamMember.middleware");

const router = express.Router({ mergeParams: true });
const {
  createProject,
  updateProject,
  getProject,
  getAllProjects,
  removeProject,
} = require("../controller/projects.controller");

router.use(authenticateUser);

router.post("/", authorizeTeamMember(["admin"]), createProject);
router.put("/:projectId", authorizeTeamMember(["admin"]), updateProject);
router.get("/:projectId", authorizeTeamMember(["admin", "tasker"]), getProject);
router.get("/", authorizeTeamMember(["admin", "tasker"]), getAllProjects);
router.delete("/:projectId", authorizeTeamMember(["admin"]), removeProject);

module.exports = router;
