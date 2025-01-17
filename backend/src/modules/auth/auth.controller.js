const express = require("express");
const router = express.Router();
const {
  register,
  login,
  requestPasswordReset,
  passwordReset,
  confirmEmail,
} = require("./auth.service");

router.post("/register", register);
router.post("/login", login);
router.post("/request-password-reset", requestPasswordReset);
router.post("/reset-password", passwordReset);
router.post("/confirm-email", confirmEmail);

module.exports = router;
