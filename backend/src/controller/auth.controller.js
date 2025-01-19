const { asyncHandler } = require("../utils/error/errorHandling");
const bcrypt = require("bcrypt");
const { User } = require("../models");
const sendEmail = require("../utils/email/sendEmail");
const {
  generateJWT,
  generateRandomToken,
} = require("../utils/security/generateToken");
const { successResponse } = require("../utils/response/successResponse");
const dotenv = require("dotenv");
dotenv.config();

const register = asyncHandler(async (req, res, next) => {
  const { email, password, firstName, lastName, profileImage } = req.body;

  // Validate input
  if (!email || !password || !firstName || !lastName) {
    next(new Error("Please provide all required fields.", { cause: 400 }));
    return;
  }

  // Check if user exists
  const existingUser = await User.findOne({ where: { email } });
  if (existingUser) {
    next(new Error("User with this email already exists.", { cause: 400 }));
    return;
  }

  // Create user
  const emailConfirmationToken = generateRandomToken();
  const newUser = await User.create({
    email,
    password,
    firstName,
    lastName,
    profileImage,
    emailConfirmationToken,
  });

  // Send confirmation email
  const confirmationUrl = `${process.env.CLIENT_URL}/confirm-email?token=${emailConfirmationToken}&email=${email}`;
  const message = `
    <h1>Email Confirmation</h1>
    <p>Please confirm your email by clicking the link below:</p>
    <a href="${confirmationUrl}">Confirm Email</a>
  `;
  try {
    await sendEmail(email, "Email Confirmation", message);
    return successResponse(
      res,
      {
        message:
          "User registered successfully. Please check your email to confirm.",
      },
      201
    );
  } catch (error) {
    console.log(error);
    // If email fails, delete the user
    await newUser.destroy();
    next(new Error("Email could not be sent.", { cause: 500 }));
  }
});

const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // Validate input
  if (!email || !password) {
    next(new Error("Please provide email and password.", { cause: 400 }));
    return;
  }

  // Find user
  const user = await User.findOne({ where: { email } });
  if (!user) {
    next(new Error("Invalid email or password.", { cause: 401 }));
    return;
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    next(new Error("Invalid email or password.", { cause: 401 }));
    return;
  }

  const token = generateJWT({ id: user.id }, process.env.JWT_EXPIRES_IN);
  return successResponse(res, {
    data: {
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        profileImage: user.profileImage,
      },
    },
    message: "user logged in in successfully.",
  });
});

const requestPasswordReset = asyncHandler(async (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    next(new Error("Please provide an email.", { cause: 400 }));
    return;
  }

  const user = await User.findOne({ where: { email } });
  if (!user) {
    // To prevent email enumeration, respond with the same message
    return successResponse(res, {
      message: "If a user with that email exists, a reset link has been sent.",
    });
  }

  // Generate reset token and expiry
  const resetToken = generateRandomToken();
  const resetPasswordExpires = Date.now() + 3600000; // 1 hour

  // Update user with reset token
  user.resetPasswordToken = resetToken;
  user.resetPasswordExpires = new Date(resetPasswordExpires);
  await user.save();

  // Send reset email
  const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}&email=${email}`;
  const message = `
    <h1>Password Reset</h1>
    <p>You requested a password reset. Click the link below to reset your password:</p>
    <a href="${resetUrl}">Reset Password</a>
    <p>If you did not request this, please ignore this email.</p>
  `;
  try {
    await sendEmail(email, "Password Reset Request", message);
    return successResponse(res, {
      message: "If a user with that email exists, a reset link has been sent.",
    });
  } catch (error) {
    // If email fails, remove reset token
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();
    next(new Error("Email could not be sent.", { cause: 500 }));
  }
});

const passwordReset = asyncHandler(async (req, res, next) => {
  const { email, token, newPassword } = req.body;

  if (!email || !token || !newPassword) {
    return next(
      new Error("Please provide email, token, and new password.", {
        cause: 400,
      })
    );
  }

  const user = await User.findOne({
    where: {
      email,
      resetPasswordToken: token,
      resetPasswordExpires: { [require("sequelize").Op.gt]: new Date() },
    },
  });

  if (!user) {
    return next(
      new Error("Invalid or expired password reset token.", { cause: 400 })
    );
  }

  // Update password
  user.password = newPassword;
  user.resetPasswordToken = null;
  user.resetPasswordExpires = null;
  await user.save();
  return successResponse(res, {
    message: "Password has been reset successfully.",
  });
});

const confirmEmail = asyncHandler(async (req, res, next) => {
  const { token, email } = req.body;

  if (!token || !email) {
    next(new Error("Invalid confirmation link.", { cause: 400 }));
    return;
  }

  const user = await User.findOne({
    where: {
      email,
      emailConfirmationToken: token,
    },
  });

  if (!user) {
    next(new Error("Invalid confirmation link."), { cause: 400 });
    return;
  }

  // Confirm email
  user.emailConfirmed = true;
  user.emailConfirmationToken = null;
  await user.save();
  return successResponse(res, {
    message: "Email has been confirmed successfully.",
  });
});

module.exports = {
  register,
  login,
  requestPasswordReset,
  passwordReset,
  confirmEmail,
};
