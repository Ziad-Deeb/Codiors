// utils/commonHelpers/deleteEntityById.js
const { NotFoundError } = require("../../errors");

const deleteEntityById = async (Model, entityId) => {
  const entity = await Model.findByPk(entityId);
  if (!entity) {
    throw new NotFoundError(`No ${Model.name.toLowerCase()} with id: ${entityId}`);
  }

  await entity.destroy();
  return { message: `${Model.name} with id: ${entityId} successfully deleted.` };
};

module.exports = deleteEntityById;
