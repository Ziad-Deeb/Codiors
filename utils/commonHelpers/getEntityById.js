// utils/helpers/getEntityById.js
const { NotFoundError } = require("../../errors");

const getEntityById = async (Model, entityId, options = {}) => {
  const entity = await Model.findByPk(entityId, options);
  if (!entity) {
    throw new NotFoundError(`No ${Model.name.toLowerCase()} with id: ${entityId}`);
  }
  return entity;
};

module.exports = getEntityById;
