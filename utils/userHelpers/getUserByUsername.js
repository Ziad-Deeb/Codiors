// utils/userHelpers/getUserByUsername.js
const { User } = require("../../models/index");
const { NotFoundError } = require("../../errors");

const getUserByUsername = async (username, attributes = { exclude: ["password"] }) => {
  const user = await User.findOne({ where: { username }, attributes });
  if (!user) {
    throw new NotFoundError(`No user with username: ${username}`);
  }
  return user;
};

module.exports = getUserByUsername;
