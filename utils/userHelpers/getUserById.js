// utils/userHelpers/getUserById.js
const { User } = require("../../models/index");
const { NotFoundError } = require("../../errors");

const getUserById = async (userId, attributes = { exclude: ["password"] }) => {
  const user = await User.findByPk(userId, { attributes });
  if (!user) {
    throw new NotFoundError(`No user with id: ${userId}`);
  }
  return user;
};

module.exports = getUserById;
