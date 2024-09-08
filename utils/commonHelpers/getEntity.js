// utils/helpers/getEntity.js
const { NotFoundError } = require("../../errors");

const getEntity = async (Model, options = {}) => {
  const entity = await Model.findOne(options);
  if (!entity) {
    throw new NotFoundError(`No ${Model.name.toLowerCase()} found with the given criteria.`);
  }
  return entity;
};

module.exports = getEntity;
