const jwt = require("jsonwebtoken");
const CustomError = require("../errors");

const extractToken = (req) => {
  const authHeader = req.get("Authorization");
  if (!authHeader) {
    throw new CustomError.UnauthenticatedError("Authentication Invalid");
  }
  const token = authHeader.split(" ")[1];
  return token;
};

const verifyToken = (token) => {
  let decodedToken;
  try {
    decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
  } catch (err) {
    throw new CustomError.UnauthenticatedError("Authentication Invalid");
  }
  if (!decodedToken) {
    throw new CustomError.UnauthenticatedError("Authentication Invalid");
  }
  return decodedToken;
};

module.exports = {
  extractToken,
  verifyToken,
};