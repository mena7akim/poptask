const express = require("express");
const { authenticateUser } = require("../middleware/auth.middleware");
const authorizeTeamMember = require("../middleware/authorizeTeamMember.middleware");

const router = express.Router({ mergeParams: true });
const {
  createTask,
  updateTask,
  popTask,
  skipTask,
  completeTask,
  deleteTask,
} = require("../controller/tasks.controller");

router.use(authenticateUser);

router.post("/", authorizeTeamMember(["admin"]), createTask);
router.put("/:taskId", authorizeTeamMember(["admin"]), updateTask);
router.get("/", authorizeTeamMember(["admin", "tasker"]), popTask);
router.post(
  "/:taskId/skip",
  authorizeTeamMember(["admin", "tasker"]),
  skipTask
);
router.post(
  "/:taskId/complete",
  authorizeTeamMember(["admin", "tasker"]),
  completeTask
);
router.delete("/:taskId", authorizeTeamMember(["admin", "tasker"]), deleteTask);

module.exports = router;
