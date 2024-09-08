// utils/userHelpers/updateUserById.js
const { User } = require("../../models/index");
const { NotFoundError } = require("../../errors");

const updateUserById = async (userId, updatedProfile) => {
  const [rowsUpdated, [user]] = await User.update(updatedProfile, {
    where: { id: userId },
    returning: true,
    individualHooks: true,
  });
  if (rowsUpdated === 0 || !user) {
    throw new NotFoundError(`No user with id: ${userId}`);
  }
  return user;
};

module.exports = updateUserById;
