// utils/problemHelpers/updateProblemById.js
const { Problem } = require("../../models/index");
const { NotFoundError } = require("../../errors");

const updateProblemById = async (problemId, updatedProblem) => {
  const [rowsUpdated, [problem]] = await Problem.update(updatedProblem, {
    where: { id: problemId },
    returning: true,
    individualHooks: true,
  });
  if (rowsUpdated === 0 || !problem) {
    throw new NotFoundError(`No problem with id: ${problemId}`);
  }
  return problem;
};

module.exports = updateProblemById;
