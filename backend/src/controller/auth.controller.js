const { asyncHandler } = require("../utils/error/errorHandling");
const bcrypt = require("bcrypt");
const { User } = require("../models");
const { generateJWT } = require("../utils/security/generateToken");
const { successResponse } = require("../utils/response/successResponse");
const dotenv = require("dotenv");
dotenv.config();

const otpGenerator = require("otp-generator");
const redisClient = require("../db/redis/redisClient");
const { otpEmailTemplate } = require("../utils/email/template");
const emailEmitter = require("../utils/eventBus/emailEmitter");

const requestLogin = asyncHandler(async (req, res, next) => {
  const { email } = req.body;

  const user = await User.scope("withPassword").findOne({ where: { email } });

  if (!user || !user.password) {
    const otp = otpGenerator.generate(6, {
      upperCase: false,
      specialChars: false,
    });
    // Save OTP to Redis
    redisClient.setEx(`register:${email}`, 300, otp);

    // Send OTP to email
    const message = otpEmailTemplate(otp);
    emailEmitter.emit("sendEmail", email, "Your OTP", message);
    return successResponse(res, {
      message: "OTP has been sent to your email.",
      data: {
        type: "register",
      },
    });
  }

  return successResponse(res, {
    message: "User found, please login with your password.",
    data: {
      type: "login",
    },
  });
});

const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  const user = await User.scope("withPassword").findOne({ where: { email } });

  if (!user) {
    return next(new Error("Invalid email or password.", { cause: 400 }));
  }

  const matched = await bcrypt.compare(password, user.password);

  if (!matched) {
    return next(new Error("Invalid email or password.", { cause: 400 }));
  }

  const token = generateJWT({ userId: user.id });

  user.password = undefined;

  return successResponse(res, {
    message: "Login successful.",
    data: { token, user },
  });
});

const register = asyncHandler(async (req, res, next) => {
  const { email, otp } = req.body;

  const storedOtp = await redisClient.get(`register:${email}`);

  if (otp !== storedOtp) {
    return next(new Error("This otp is invalid or expired.", { cause: 400 }));
  }

  const user = await User.findOne({ where: { email } });

  if (user) {
    const token = generateJWT({ userId: user.id });

    return successResponse(res, {
      message: "User logged in successfully.",
      data: { token, user },
    });
  }

  // Create user
  const newUser = await User.create({ email });

  // Generate JWT
  const token = generateJWT({ userId: newUser.id });

  newUser.password = undefined;
  newUser.deletedAt = undefined;

  return successResponse(
    res,
    {
      message: "User created successfully.",
      data: { token, user: newUser },
    },
    201
  );
});

const requestPasswordReset = asyncHandler(async (req, res, next) => {
  const { email } = req.body;
  const user = await User.scope("withPassword").findOne({
    where: { email },
  });
  console.log("user", user);

  if (!user || !user.password) {
    return next(
      new Error("Please register or create profile first.", { cause: 400 })
    );
  }

  const otp = otpGenerator.generate(6, {
    upperCase: false,
    specialChars: false,
  });

  // Save OTP to Redis

  redisClient.setEx(`password-reset:${email}`, 300, otp);

  // Send OTP to email
  const message = otpEmailTemplate(otp);

  emailEmitter.emit("sendEmail", email, "Your OTP", message);

  return successResponse(res, {
    message: "OTP has been sent to your email.",
  });
});

const passwordReset = asyncHandler(async (req, res, next) => {
  const { email, otp, newPassword } = req.body;

  const user = await User.findOne({ where: { email } });

  if (!user) {
    return next(new Error("User not found.", { cause: 400 }));
  }

  // Check OTP
  const storedOtp = await redisClient.get(`password-reset:${email}`);

  if (otp !== storedOtp) {
    return next(new Error("This otp is invalid or expired.", { cause: 400 }));
  }

  // Update password
  await user.update({ password: newPassword });

  return successResponse(res, {
    message: "Password has been reset successfully.",
  });
});

module.exports = {
  requestLogin,
  login,
  register,
  requestPasswordReset,
  passwordReset,
};
