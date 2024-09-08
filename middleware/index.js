// middleware/index.js
const { authenticateCompany } = require('./companyAuthentication');
const { authenticateUser } = require('./userAuthentication');
const { extractToken, verifyToken } = require('./sharedAuthentication');
const {authorize, userHasPermissionToAccessProblem} = require("./authorization");

module.exports = {
  authenticateCompany,
  authenticateUser,
  extractToken,
  verifyToken,
  authorize,
  userHasPermissionToAccessProblem,
};