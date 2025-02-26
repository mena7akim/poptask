const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const dotenv = require("dotenv");
dotenv.config();

const generateJWT = (payload, expiresIn = process.env.JWT_EXPIRES_IN) => {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn });
};

const verifyJWT = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

const generateRandomToken = () => {
  return crypto.randomBytes(32).toString("hex");
};

module.exports = { generateJWT, verifyJWT, generateRandomToken };
