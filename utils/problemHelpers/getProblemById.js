// utils/problemHelpers/getProblemById.js
const { Problem } = require("../../models/index");
const { NotFoundError } = require("../../errors");

const getProblemById = async (problemId, options = {}) => {
    const problem = await Problem.findByPk(problemId, options);
    if (!problem) {
      throw new NotFoundError(`No problem with id: ${problemId}`);
    }
    return problem;
  };

module.exports = getProblemById;
