// utils/helpers/getAllEntitiesWithPagination.js
const getAllEntitiesWithPagination = async (Model, options = {}) => {
    const { page = 1, limit = 10, ...restOptions } = options;
  
    const offset = (page - 1) * limit;
  
    const entities = await Model.findAndCountAll({
      ...restOptions,
      limit,
      offset,
    });
  
    const totalPages = Math.ceil(entities.count / limit);
  
    return {
      totalItems: entities.count,
      totalPages,
      currentPage: page,
      items: entities.rows,
    };
  };
  
  module.exports = getAllEntitiesWithPagination;
  