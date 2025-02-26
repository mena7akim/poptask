const { User } = require("../models");
const { asyncHandler } = require("../utils/error/errorHandling");
const { verifyJWT } = require("../utils/security/generateToken");

const authenticateUser = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  // Unauthorized if no token is provided
  if (!token) {
    return next(
      new Error("Please login so you can access this!", { cause: 401 })
    );
  }

  const decoded = verifyJWT(token); // Verify the token
  const user = await User.findByPk(decoded.userId); // Find the user by ID from the token

  // Unauthorized if user not found
  if (!user) {
    return next(
      new Error("Please login so you can access this!", { cause: 401 })
    );
  }
  
  req.user = user; // Attach user to request object
  next(); // Proceed to the next middleware or route handler
});

module.exports = { authenticateUser };
