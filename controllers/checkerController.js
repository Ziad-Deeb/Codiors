const { Checker, Problem, Programming_Language } = require("../models/index");
const CustomError = require("../errors");
const handleError = require('../utils/errorHandler');

// Create a new checker
exports.createChecker = async (req, res, next) => {
  try {
    const problem_id = req.params.problemId;
    const { code } = req.body;

    const problem = await Problem.findOne({
      where: { id: problem_id },
      attributes: ["owner_id"],
    });

    if (!problem) {
      throw new CustomError.NotFoundError(`No problem found with id: ${problem_id}`);
    }

    if (problem.owner_id !== parseInt(req.userId)) {
      throw new CustomError.UnauthorizedError("Only the owner can create the checker");
    }

    // Check if a checker already exists for the problem
    const existingChecker = await Checker.findOne({ where: { problem_id } });

    if (existingChecker) {
      throw new CustomError.BadRequestError("A checker already exists for this problem");
    }

    // Create a new checker
    const checker = await Checker.create({ problem_id, code });

    res.status(201).json({ message: "Checker created", checker });
  } catch (err) {
    handleError(err, next, "Error creating checker");
  }
};

// Update a checker
exports.updateChecker = async (req, res, next) => {
  try {
    const problem_id  = req.params.problemId;
    const { code, programming_language_id  } = req.body;

    const problem = await Problem.findOne({
      where: { id: problem_id },
      attributes: ["owner_id"],
    });

    if (!problem) {
      throw new CustomError.NotFoundError(`No problem found with id: ${problem_id}`);
    }

    if (problem.owner_id !== parseInt(req.userId)) {
      throw new CustomError.UnauthorizedError("Only the owner can update the checker");
    }

    const programmingLanguage = await Programming_Language.findByPk(programming_language_id);
    if (!programmingLanguage) {
      throw new CustomError.NotFoundError(`No programming language found with id: ${programming_language_id}`);
    }

    // Check if a checker exists for the problem
    let existingChecker = await Checker.findOne({ where: { problem_id } });

    if (!existingChecker) {
      // Create a new checker
      existingChecker = await Checker.create({
        problem_id: problem_id,
        code: code,
        programming_language_id: programming_language_id,
      });
      console.log(existingChecker);
    } else {
      // Update the code field of the existing checker
      await existingChecker.update({ code: code, programming_language_id: programming_language_id });
    }

    res.status(200).json({ message: "Checker successfully updated", checker: existingChecker  });
  } catch (err) {
    handleError(err, next, "Error updating checker");
  }
};

// Get a checker for a specific problem
exports.getCheckerByProblemId = async (req, res, next) => {
  try {
    const { problemId } = req.params;

    // Find the checker by problem ID
    const checker = await Checker.findOne({ where: { problem_id: problemId } });

    if (!checker) {
      throw new CustomError.NotFoundError(`No checker found for problem with ID: ${problemId}`);
    }

    res.status(200).json({ checker });
  } catch (err) {
    handleError(err, next, "Error retrieving checker");
  }
};
