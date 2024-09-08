const { Company } = require("../models/index");
const CustomError = require("../errors");
const { extractToken, verifyToken } = require("./sharedAuthentication");

const authenticateCompany = async (req, res, next) => {
  try {
    const token = extractToken(req);
    const decodedToken = verifyToken(token);
    req.companyId = parseInt(decodedToken.id, 10);
    req.company = await Company.findByPk(req.companyId);
    
    if (!req.company) {
      throw new CustomError.UnauthenticatedError("Authentication Invalid");
    }
    
    next();
  } catch (err) {
    next(new CustomError.UnauthenticatedError("Authentication Invalid"));
  }
};

module.exports = {
  authenticateCompany,
};