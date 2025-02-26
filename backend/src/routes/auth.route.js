const express = require("express");
const router = express.Router();
const {
  requestLogin,
  register,
  login,
  requestPasswordReset,
  passwordReset,
} = require("../controller/auth.controller");


router.post("/request-login", requestLogin);

router.post("/login", login);

router.post("/register", register);

router.post("/request-password-reset", requestPasswordReset);

router.post("/password-reset", passwordReset);


module.exports = router;