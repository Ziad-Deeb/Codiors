// utils/helpers/getAllEntities.js
const getAllEntities = async (Model, options = {}) => {
    const entities = await Model.findAll(options);
    return entities;
  };
  
  module.exports = getAllEntities;
  