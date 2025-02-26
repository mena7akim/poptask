const { User } = require("../models");
const { successResponse } = require("../utils/response/successResponse");
const { asyncHandler } = require("../utils/error/errorHandling");

const createProfile = asyncHandler(async (req, res) => {
  const user = req.user;

  const { firstName, lastName, password } = req.body;

  // Check if user has already created a profile

  if (user.firstName) {
    return next(new Error("Profile already exists.", { cause: 400 }));
  }

  // Update user profile
  const updatedUser = await user.update({ firstName, lastName, password });

  return successResponse(res, {
    message: "Profile created successfully.",
    data: updatedUser,
  });
});

const updateProfile = asyncHandler(async (req, res, next) => {
  const user = req.user;

  const { firstName, lastName } = req.body;

  // Check if user has already created a profile

  if (!user.firstName) {
    return next(new Error("Profile does not exist.", { cause: 400 }));
  }

  // Update user profile
  const updatedUser = await user.update({ firstName, lastName });

  return successResponse(res, {
    message: "Profile updated successfully.",
    data: updatedUser,
  });
});

module.exports = { createProfile, updateProfile };
