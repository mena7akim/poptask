const express = require("express");
const router = express.Router();
const { authenticateUser } = require("../middleware/auth.middleware");
const {
  createProfile,
  updateProfile,
} = require("../controller/users.controller");

router.use(authenticateUser);
router.post("/", createProfile);
router.put("/", updateProfile);

module.exports = router;
