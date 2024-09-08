// utils/commonHelpers/updateEntityById.js
const { NotFoundError } = require("../../errors");

const updateEntityById = async (Model, entityId, options = {}) => {
  console.log(options);
  const { updateData, ...restOptions } = options;

  // Get the keys from updateData to form attributes array
  const attributes = [...Object.keys(updateData), Model.primaryKeyAttribute];

  // Find the entity by ID with the attributes to be updated
  const entity = await Model.findByPk(entityId, {
    ...restOptions,
    attributes,
  });

  if (!entity) {
    throw new NotFoundError(`No ${Model.name.toLowerCase()} with id: ${entityId}`);
  }

  await entity.update(updateData);

  return entity;
};

module.exports = updateEntityById;
