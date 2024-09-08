const { User, Role } = require("../models/index");
const CustomError = require("../errors");
const { extractToken, verifyToken } = require("./sharedAuthentication");

const authenticateUser = async (req, res, next) => {
  try {
    const token = extractToken(req);
    const decodedToken = verifyToken(token);
    req.userId = parseInt(decodedToken.userId, 10);
    req.user = await User.findByPk(req.userId, {
      include: [
        {
          model: Role,
          attributes: ['name'],
        },
      ],
    });

    if (!req.user) {
      throw new CustomError.UnauthenticatedError("Authentication Invalid");
    }

    req.user.roles = req.user.Roles.map(role => role.name);

    next();
  } catch (err) {
    next(new CustomError.UnauthenticatedError("Authentication Invalid"));
  }
};

module.exports = {
  authenticateUser,
};