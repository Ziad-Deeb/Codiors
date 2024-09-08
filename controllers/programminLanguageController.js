const { Programming_Language } = require('../models/index');
const { NotFoundError, BadRequestError, InternalServerError } = require("../errors");
const handleError = require('../utils/errorHandler');

// Get all programming languages
exports.getProgrammingLanguages = async (req, res, next) => {
  try {
    const Programming_Languages = await Programming_Language.findAll({
      attributes: ['id', 'name'],
    });
    res.status(200).json(Programming_Languages);
  } catch (err) {
    handleError(err, next, "Error retrieving programming languages");
  }
};

// Create a programming language
exports.createProgrammingLanguage = async (req, res, next) => {
  try {
    const { name } = req.body;
    const newProgrammingLanguage = await Programming_Language.create({ name });
    res.status(201).json({ message: "Programming language created", Programming_Language: newProgrammingLanguage });
  } catch (err) {
    handleError(err, next, "Error creating programming language");
  }
};

// Update a programming language
exports.updateProgrammingLanguage = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    const Programming_Language = await Programming_Language.findByPk(id);
    if (!Programming_Language) {
      throw new NotFoundError(`No programming language found with id: ${id}`);
    }

    Programming_Language.name = name;
    await Programming_Language.save();

    res.status(200).json({ message: "Programming language updated", Programming_Language });
  } catch (err) {
    handleError(err, next, "Error updating programming language");
  }
};

// Delete a programming language
exports.deleteProgrammingLanguage = async (req, res, next) => {
  try {
    const { id } = req.params;

    const Programming_Language = await Programming_Language.findByPk(id);
    if (!Programming_Language) {
      throw new NotFoundError(`No programming language found with id: ${id}`);
    }

    await Programming_Language.destroy();
    res.status(200).json({ message: "Programming language deleted", Programming_Language });
  } catch (err) {
    handleError(err, next, "Error deleting programming language");
  }
};
