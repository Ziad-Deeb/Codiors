const { User } = require('../../models');
const { BadRequestError } = require('../../errors');

const findUserByUsername = async (username) => {
  const user = await User.findOne({
    where: { username },
    attributes: ["id"],
  });

  if (!user) {
    throw new BadRequestError(`User with username '${username}' not found`);
  }

  return user;
};

module.exports = findUserByUsername;
