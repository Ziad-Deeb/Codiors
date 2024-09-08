// utils/userHelpers/getAllUsers.js
const { User } = require("../../models/index");

const getAllUsers = async (attributes = { exclude: ["password"] }) => {
  return await User.findAll({ attributes });
};

module.exports = getAllUsers;
